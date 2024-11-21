import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { OutsideParcelDto } from '@/domain/ord/parcel/dto/outside-parcel.dto';
import _ from 'lodash';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { getRepository } from 'typeorm';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { SmsService } from '@/domain/external/sms/sms.service';
import { PlatformService } from '@/domain/base/ssm/platform/platform.service';
import { OutsideExternalParcelDto } from '@/domain/ord/parcel/dto/outside-external-parcel.dto';

export class OutsideParcelListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    private parcelService: ParcelExtendService,
    private xPushService: XPushService,
    private trackingService: TrackingService,
    private smsService: SmsService,
    private platformService: PlatformService,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('CMS_IMPORT_OUTSIDE_PARCEL', this);
    this.kafkaClient.subscribeToResponseOf('CMS_IMPORT_OUTSIDE_EXTERNAL_PARCEL', this);
    Logger.log('CMS_IMPORT_OUTSIDE_PARCEL subscribe success');
    Logger.log('CMS_IMPORT_OUTSIDE_EXTERNAL_PARCEL subscribe success');
  }

  /**
   * 导入外部包裹内部账号包裹
   * @param data
   */
  @SubscribeTo('CMS_IMPORT_OUTSIDE_PARCEL')
  async outsideParcelConsumer(@Payload() data: any) {
    let errorTrackingNumber = null;
    try {
      let outsideParcelArray: OutsideParcelDto[] = JSON.parse(data).body.parcelArray;
      if (!outsideParcelArray || !outsideParcelArray.length) {
        return;
      }
      errorTrackingNumber = outsideParcelArray[0].trackingNumber;
      // 过滤出包含必传属性的
      outsideParcelArray = outsideParcelArray.filter(
        outsideParcel => outsideParcel.trackingNumber && outsideParcel.shippingNumber && outsideParcel.channel,
      );

      const parcelArray = await this.parcelService.saveOutsideParcel(outsideParcelArray);

      const parcelArrayGroup = _.groupBy(parcelArray, 'transporter');
      for (const transporter in parcelArrayGroup) {
        const parcels = parcelArrayGroup[transporter];
        const firstParcel = parcels[0];
        const { smsProductCode, smsIsPushOutside } = this.platformService.getSmsProduct(
          firstParcel?.platform,
          firstParcel?.transporter,
        );
        if (smsProductCode && smsIsPushOutside) {
          this.smsService
            .pushSortingParcelBatch(
              smsProductCode,
              parcelArray.map(parcel => {
                return {
                  trackingNumber: parcel.trackingNumber,
                  transporter: parcel.transporter,
                  postalCode: parcel.receiverPostalCode,
                  clientId: parcel.clientId,
                  platform: parcel.platform,
                  account: parcel.transporterAccountId,
                  waybillNumber: null,
                  barcode: outsideParcelArray.find(f => f.trackingNumber === parcel.trackingNumber)?.barcode,
                };
              }),
            )
            .catch(reason => {
              if (process.env.NODE_ENV.includes('production')) {
                this.xPushService.sendDingDing(
                  `导入时，推送SMS包裹(${parcelArray.map(m => m.trackingNumber).toString()})失败：${reason}。`,
                );
              }
            });
        }
      }

      // this.getTrackings(parcelArray).then();
    } catch (e) {
      this.xPushService.sendDingDing(`导入外部包裹${errorTrackingNumber}出现异常 ${e.message}`, 'tracking').then();
    }
  }

  /**
   * 导入外部包裹外部账号包裹
   * @param data
   */
  @SubscribeTo('CMS_IMPORT_OUTSIDE_EXTERNAL_PARCEL')
  async outsideExternalParcelConsumer(@Payload() data: any) {
    let errorTrackingNumber = null;
    try {
      const platform = JSON.parse(data).body.platform;
      let outsideExternalParcelArray: OutsideExternalParcelDto[] = JSON.parse(data).body.parcelArray;
      if (!platform) {
        return;
      }
      if (!outsideExternalParcelArray || !outsideExternalParcelArray.length) {
        return;
      }
      errorTrackingNumber = outsideExternalParcelArray[0].trackingNumber;
      // 过滤出包含必传属性的
      outsideExternalParcelArray = outsideExternalParcelArray.filter(
        outsideParcel => outsideParcel.trackingNumber && outsideParcel.shippingNumber && outsideParcel.lastmileProvider,
      );

      await this.parcelService.saveOutsideExternalParcel(outsideExternalParcelArray, platform);
    } catch (e) {
      this.xPushService
        .sendDingDing(`外部账号包裹导入异常${errorTrackingNumber}出现异常 ${e.message}`, 'tracking')
        .then();
    }
  }

  private async getTrackings(parcelArray) {
    const parcelTransporterGroup = _.chain(parcelArray)
      .filter(parcel => !['CMS_TRACK', 'COLISPRIVE'].includes(parcel.transporter))
      .filter(parcel => !(parcel.transporter == 'COLISSIMO' && parcel.platform == 'ESENDEO'))
      .groupBy('transporter')
      .value();
    for (const transporter in parcelTransporterGroup) {
      const parcelArray = parcelTransporterGroup[transporter];
      const parcelAccountGroup = _.groupBy(parcelArray, 'transporterAccountId');
      for (const account in parcelAccountGroup) {
        const accountInfo = await getRepository(Account).findOne({ account });
        await this.trackingService.fetchTrackingAndInsert(
          transporter,
          parcelAccountGroup[account],
          !accountInfo.external,
        );
      }
    }
  }
}
