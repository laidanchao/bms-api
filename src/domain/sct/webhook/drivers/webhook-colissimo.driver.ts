import { WebhookTrackingDto } from '@/domain/sct/webhook/dto/webhook-tracking.dto';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import { WebhookBaseDriver } from '@/domain/sct/webhook/drivers/webhook-base.driver';
import { getRepository, MoreThan } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import _ from 'lodash';
import moment from 'moment';

export class WebhookColissimoDriver extends WebhookBaseDriver {
  /**
   * webhook url 轨迹插入
   * @param body
   */
  async build(body: WebhookTrackingDto, headers, platformAccountList) {
    if (Object.keys(body).length == 0) {
      return;
    }
    const trackingNumber = _.get(body, 'parcel.parcelNumber', '');
    const contractNumber = _.get(body, 'parcel.contractNumber', '');
    const measuredDimension = _.get(body, 'parcel.measuredDimension', '');
    const reference = _.get(body, 'parcel.customerParcelReference', '');
    const trackings = _.get(body, 'parcel.event', []);

    const record = { webhookSource: WEBHOOK_SOURCE.COLISSIMO, trackingNumber, body, headers };

    try {
      const trackingArray = _.map(trackings, tracking => {
        return {
          trackingNumber,
          reference,
          timestamp: tracking.date,
          event: tracking.code,
          description: tracking.labelLong,
          location: tracking.siteName + tracking.siteZipCode,
        };
      });

      // 保存包裹尺寸
      await this.saveDimension(trackingNumber, measuredDimension);
      let CMAccount: any = {};
      CMAccount = _.find(platformAccountList, it => it.account === contractNumber);
      if (!CMAccount || !CMAccount.account) {
        const CMParcel = await getRepository(Parcel).findOne({
          where: { trackingNumber },
          order: { createdAt: 'DESC' },
        });
        if (CMParcel && CMParcel.transporterAccountId) {
          // throw new Error('接收到的账号信息有误');
          return {
            data: {
              trackingNumber: '',
              trackingArray: [],
              account: '',
              platform: '',
            },
            record,
          };
        }
      }
      return {
        data: {
          trackingNumber,
          trackingArray,
          account: CMAccount?.account,
          platform: CMAccount?.platform || '',
        },
        record,
      };
    } catch (e) {
      throw new Error(JSON.stringify({ trackingNumber, account: contractNumber, message: e.message, record }));
    }
  }

  /**
   * 保存包裹尺寸
   * @param trackingNumber
   * @param measuredDimension
   * @private
   */
  private async saveDimension(trackingNumber: string, measuredDimension: string) {
    const dimension: number[] = measuredDimension.split('x').map(m => Number(m));
    if (dimension.some(e => e < 0) || dimension.every(e => !e)) {
      return;
    }

    // 最近半年的日期
    const halfYearAgo = moment()
      .subtract(6, 'months')
      .format();
    await getRepository(Parcel).update(
      { trackingNumber, createdAt: MoreThan(halfYearAgo) },
      {
        supplierDimension: dimension,
      },
    );
  }
}
