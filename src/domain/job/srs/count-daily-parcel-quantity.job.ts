import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import moment from 'moment';
import _ from 'lodash';
import { QuantityDistributionService } from '@/domain/srs/quantity-distribution/service/quantity-distribution.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';

/**
 * 用于统计每日包裹下单、上网数量
 * 通过 declaredAt 进行每日的统计
 * 这个数据非常重要 要每天检查
 *
 * @author keminfeng、huangjiangyan
 */
@Injectable()
export class CountDailyParcelQuantityJob extends NormalJob {
  constructor(
    private readonly parcelService: ParcelExtendService,
    private readonly quantityDistributionService: QuantityDistributionService,
  ) {
    super();
  }

  protected async handle(option?): Promise<any> {
    option = CountDailyParcelQuantityJob.setDateInterval(option, 15);
    const { startDate, endDate } = option;
    const declaredParcelQuantityPromise = this.parcelService.countParcelQuantity(startDate, endDate, 'declared');
    const transferredParcelQuantityPromise = this.parcelService.countParcelQuantity(startDate, endDate, 'transferred');
    const arrivedAtParcelQuantityPromise = this.parcelService.countParcelQuantity(startDate, endDate, 'arrived');
    const parcelQuantityResultArray = await Promise.all([
      declaredParcelQuantityPromise,
      transferredParcelQuantityPromise,
      arrivedAtParcelQuantityPromise,
    ]);
    const parcelQuantityArray = this.buildQuantityDistributionArray(
      parcelQuantityResultArray[0],
      parcelQuantityResultArray[1],
      parcelQuantityResultArray[2],
    );
    for (const chunkParcelQuantityArray of _.chunk(parcelQuantityArray, 1000)) {
      await this.quantityDistributionService.createOrCover(chunkParcelQuantityArray);
    }
  }

  _setNullElementAsUnknown(array) {
    const keys = ['clientId', 'transporterAccountId', 'channel', 'platform', 'transporter'];
    array.forEach(item => {
      keys.forEach(key => {
        if (!item[key]) {
          item[key] = 'UNKNOWN';
        }
      });
    });
  }

  private static setDateInterval(option, interval) {
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

  private buildQuantityDistributionArray(
    declaredParcelQuantityArray,
    transferredParcelQuantityArray,
    arrivedAtParcelQuantityArray,
  ) {
    this._setNullElementAsUnknown(declaredParcelQuantityArray);
    this._setNullElementAsUnknown(transferredParcelQuantityArray);
    this._setNullElementAsUnknown(arrivedAtParcelQuantityArray);

    const parcelQuantityArray = declaredParcelQuantityArray;
    // merge transferredParcelQuantityArray into parcelQuantityArray
    this.mergeParcelQuantityArray(parcelQuantityArray, transferredParcelQuantityArray, 'transferred');
    // merge arrivedParcelQuantityArray into parcelQuantityArray
    this.mergeParcelQuantityArray(parcelQuantityArray, arrivedAtParcelQuantityArray, 'arrived');

    return parcelQuantityArray;
  }

  private mergeParcelQuantityArray(parcelQuantityArray, targetArray, target) {
    targetArray.forEach(item => {
      const index = parcelQuantityArray.findIndex(parcelQuantity => {
        return (
          parcelQuantity.clientId.toString() === item.clientId.toString() &&
          parcelQuantity.transporterAccountId.toString() === item.transporterAccountId.toString() &&
          parcelQuantity.date.toString() === item.date.toString() &&
          parcelQuantity.transporter.toString() === item.transporter.toString() &&
          parcelQuantity.platform.toString() === item.platform.toString() &&
          parcelQuantity.channel.toString() === item.channel.toString() &&
          parcelQuantity.trackingNumberPrefix.toString() === item.trackingNumberPrefix.toString()
        );
      });
      if (index === -1) {
        const parcelQuantity = {
          clientId: item.clientId,
          transporterAccountId: item.transporterAccountId,
          date: item.date,
          transporter: item.transporter,
          platform: item.platform,
          channel: item.channel,
          trackingNumberPrefix: item.trackingNumberPrefix,
        };
        parcelQuantity[`${target}Quantity`] = item[`${target}Quantity`];
        parcelQuantityArray.push(parcelQuantity);
      } else {
        parcelQuantityArray[index][`${target}Quantity`] = item[`${target}Quantity`];
      }
    });
  }
}
