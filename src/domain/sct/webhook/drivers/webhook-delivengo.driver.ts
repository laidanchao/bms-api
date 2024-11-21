import { WebhookBaseDriver } from '@/domain/sct/webhook/drivers/webhook-base.driver';
import { Tracking } from '../../core/entity/tracking.entity';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import _ from 'lodash';
import { getRepository } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';

export class WebhookDelivengoDriver extends WebhookBaseDriver {
  async build(body: any, headers: any) {
    const trackingNumber =
      _.chain(body?.numbers)
        .map('number')
        .join()
        .value() || '';
    const record = { webhookSource: WEBHOOK_SOURCE.DELIVENGO, trackingNumber, body, headers };
    try {
      const trackingArray = [];
      _.map(body.numbers, number => {
        _.map(_.sortBy(number.status, 'status_date'), it => {
          const tracking = new Tracking();
          tracking.trackingNumber = number.number;
          tracking.event = it.status_code;
          tracking.timestamp = it.status_date;
          tracking.description = it.status_label;
          tracking.location = `${it.localization_code ? it.localization_code + ',' : ''} ${
            it.localization_label ? it.localization_label : ''
          }`;
          tracking.transporter = 'DELIVENGO';
          trackingArray.push(tracking);
        });
      });
      const parcel = await getRepository(Parcel).findOne({
        where: { trackingNumber },
        select: ['transporterAccountId', 'platform'],
        order: { createdAt: 'DESC' },
      });
      if (!parcel || !parcel.transporterAccountId) {
        throw new Error(`找不到账号配置`);
      }
      return {
        data: {
          trackingNumber,
          trackingArray,
          account: parcel.transporterAccountId,
          platform: parcel.platform,
        },
        record,
      };
    } catch (e) {
      throw new Error(JSON.stringify({ trackingNumber, account: '', message: e.message, record }));
    }
  }
}
