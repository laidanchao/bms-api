import { WebhookBaseDriver } from '@/domain/sct/webhook/drivers/webhook-base.driver';
import { Tracking } from '../../core/entity/tracking.entity';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import moment from 'moment';
import _ from 'lodash';

export class WebhookColicoliDriver extends WebhookBaseDriver {
  async build(body: any, headers: any, platformAccountList) {
    const data = JSON.parse(body);
    const trackingNumber = data.trackingNumber;
    const record = { webhookSource: WEBHOOK_SOURCE.COLICOLI, trackingNumber, body, headers };
    try {
      const tracking = Tracking.create({
        trackingNumber,
        event: data.code || data.event,
        timestamp: moment.utc(data.timestamp).toDate(),
        description: data.fr,
        location: data.location || '',
        fromFile: false,
        transporter: 'COLICOLI',
      });
      const CCAccount = _.find(
        platformAccountList,
        it => it.accountInfo.tracking_webhook_account === data.platformCode,
      );
      if (!CCAccount || !CCAccount.account) {
        throw new Error(`找不到账号配置`);
      }
      return {
        data: {
          trackingNumber,
          trackingArray: [tracking],
          account: CCAccount.account,
          platform: CCAccount.platform,
        },
        record,
      };
    } catch (e) {
      throw new Error(JSON.stringify({ trackingNumber, account: data.platformCode, message: e.message, record }));
    }
  }
}
