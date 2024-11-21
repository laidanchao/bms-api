import { In } from 'typeorm';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { ParcelAgingService } from '@/domain/ord/parcel-aging/parcel-aging.service';
import { NormalJob } from '@/domain/job/base/normal.job';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { KafkaMessage } from 'kafkajs';
import { Payload } from '@nestjs/microservices';
import moment from 'moment';
import { AverageParcelAgingService } from '@/domain/srs/average-parcel-aging/service/average-parcel-aging.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';

/**
 *
 * 每天执行一次
 * 计算每天的平均包裹时效
 *
 * 作为 Kafka Topic 'parcel-aging' 的消费者
 * 消费消息队列中的 trackingNumber 计算每个 parcel 的时效
 * 保存到 parcel 表
 *
 * @author keminfeng
 */
@Injectable()
export class ParcelAgingJob extends NormalJob implements OnModuleInit {
  private config: any;

  constructor(
    private parcelAgingService: ParcelAgingService,
    private readonly parcelService: ParcelExtendService,
    private readonly averageParcelAgingService: AverageParcelAgingService,
    private readonly configService: ConfigService,
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
  ) {
    super();
    this.config = configService.get(this.constructor.name);
  }

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('parcel-aging', this);
    Logger.log('parcel-aging subscribe success');
  }

  protected async handle(option?): Promise<any> {
    option = this.setDateInterval(option, 30);
    const dateArray = this.parseDateArray(option);
    const averageTransferredAgingArray = [];
    const averageArrivedAgingArray = [];
    const transferredAgingArrayPromise = dateArray.map(async date => {
      const averageTransferredAgings = await this.parcelAgingService.fetchAverageParcelAging(date, 'transferred');
      averageTransferredAgingArray.push(...averageTransferredAgings);
    });
    const arrivedAgingArrayPromise = dateArray.map(async date => {
      const averageArrivedAgings = await this.parcelAgingService.fetchAverageParcelAging(date, 'arrived');
      averageArrivedAgingArray.push(...averageArrivedAgings);
    });
    await Promise.all([...transferredAgingArrayPromise, ...arrivedAgingArrayPromise]);

    const averageParcelAgingArray: any = averageTransferredAgingArray.map(item => {
      return {
        date: item.date,
        platform: item.platform,
        channel: item.channel,
        productCode: item.productCode,
        transporterAccountId: item.transporterAccountId,
        transporterId: item.transporterId,
        averageTransferredAging: item.averageTransferredAging,
      };
    });

    averageArrivedAgingArray.forEach(item => {
      const index = averageParcelAgingArray.findIndex(
        averageParcelAging =>
          averageParcelAging.date === item.date &&
          averageParcelAging.platform === item.platform &&
          averageParcelAging.channel === item.channel &&
          averageParcelAging.productCode === item.productCode &&
          averageParcelAging.transporterAccountId === item.transporterAccountId &&
          averageParcelAging.transporterId === item.transporterId,
      );
      if (index === -1) {
        averageParcelAgingArray.push({
          date: item.date,
          platform: item.platform,
          channel: item.channel,
          productCode: item.productCode,
          transporterAccountId: item.transporterAccountId,
          transporterId: item.transporterId,
          averageArrivedAging: item.averageArrivedAging,
        });
      } else {
        averageParcelAgingArray[index].averageArrivedAging = item.averageArrivedAging;
      }
    });
    averageParcelAgingArray.forEach(item => {
      for (const key of ['transporterId', 'transporterAccountId', 'platform', 'productCode', 'channel']) {
        if (!item[key]) {
          item[key] = 'UNKNOWN';
        }
      }
    });
    await this.averageParcelAgingService.createOrCover(averageParcelAgingArray);
  }

  @SubscribeTo('parcel-aging')
  async parcelAgingConsumer(@Payload() data: KafkaMessage) {
    let parcels = JSON.parse(data + '').body.parcels;
    const trackingNumbers = JSON.parse(data + '').body.trackingNumbers;
    if (_.isEmpty(parcels) && !_.isEmpty(trackingNumbers)) {
      parcels = await this.parcelService.find({
        where: {
          trackingNumber: In(trackingNumbers),
        },
      });
    }
    parcels = _.uniqBy(parcels, 'trackingNumber');
    await this.parcelAgingService.computeParcelAging(parcels);
  }

  private setDateInterval(option, interval: number) {
    if (!option || (!option.startDate && !option.endDate)) {
      option = {};
      option.startDate = moment()
        .utc()
        .add(-interval, 'days')
        .format('YYYY-MM-DD');
      option.endDate = moment()
        .utc()
        .format('YYYY-MM-DD');
    } else if (!option.startDate) {
      option.startDate = moment(option.endDate, 'YYYY-MM-DD')
        .utc()
        .add(-interval, 'days')
        .format('YYYY-MM-DD');
    } else if (!option.endDate) {
      option.endDate = moment(option.startDate, 'YYYY-MM-DD')
        .utc()
        .add(interval, 'days')
        .format('YYYY-MM-DD');
    }
    return option;
  }

  private parseDateArray(option) {
    const currentDate = moment(option.startDate, 'YYYY-MM-DD');
    const endDate = moment(option.endDate, 'YYYY-MM-DD');
    const dateArray = [];
    while (currentDate <= endDate) {
      dateArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }
    return dateArray;
  }
}
