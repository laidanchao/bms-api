import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { WebhookBaseDriver } from '@/domain/sct/webhook/drivers/webhook-base.driver';
import moment from 'moment';
import _ from 'lodash';

export class WebhookCainiaoDriver extends WebhookBaseDriver {
  /**
   * webhook url 轨迹插入
   * @param body
   */
  async build(body: any, headers, platformAccountList) {
    const data = JSON.parse(body.logistics_interface);
    const trackingNumber = data.mailNo;
    const record = { webhookSource: WEBHOOK_SOURCE.CAINIAO, trackingNumber, body, headers };
    try {
      const traceDetail = data.traceDetail;
      const { actionCode, time, timeZone, standardDesc, location, customerizedDesc } = traceDetail;
      const validTime = time.replace(/( [\d]{2})-(\d{2})-(\d{2})/g, '$1:$2:$3');
      const tracking = Tracking.create({
        trackingNumber,
        event: actionCode,
        timestamp: moment
          .tz(validTime, moment.tz.names().includes(timeZone) ? timeZone : 'Asia/Shanghai')
          .utc()
          .toDate(),
        description: customerizedDesc || standardDesc,
        location: location || '',
        fromFile: false,
      });
      const CNAccount = _.find(platformAccountList, it => it.accountInfo.logistic_provider_id === body.partner_code);
      if (!CNAccount || !CNAccount.account) {
        throw new Error(`找不到账号配置`);
      }
      return {
        data: {
          trackingNumber,
          trackingArray: [tracking],
          account: CNAccount.account,
          platform: CNAccount.platform,
        },
        record,
      };
    } catch (e) {
      throw new Error(JSON.stringify({ trackingNumber, account: body.partner_code, message: e.message, record }));
    }
  }
}
