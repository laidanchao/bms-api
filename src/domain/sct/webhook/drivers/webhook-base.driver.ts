import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import TrackingWebhookLog from '@/domain/sct/webhook/entity/trackingWebhookLog.entity';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import { getRepository } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';

export abstract class WebhookBaseDriver {
  /**
   * 拼装轨迹数据
   * @param body
   * @param headers
   */
  abstract build(
    body: any,
    headers: any,
    platformAccountList: any,
  ): Promise<{
    data: { trackingNumber: string; trackingArray: Tracking[]; account: string; platform: string; parcel?: Parcel };
    record: { webhookSource: string; trackingNumber: string; body: any; headers: any };
  }>;
}
