import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';

@Entity({
  name: 'sct_webhook_record_hot',
})
export class TrackingWebhookLog extends BasicEntity {
  @Column({ type: 'varchar' })
  trackingNumber: string;

  @Column('varchar', { comment: 'webhook-url发给cms的请求体' })
  requestBody: string;

  @Column('varchar', { comment: 'webhook-url发给cms的header' })
  requestHeader: string;

  @Column('varchar', { comment: '平台' })
  webhookSource: WEBHOOK_SOURCE;

  @Column('varchar')
  transporterAccount: string;

  @Column('boolean')
  isActive: boolean;
}

export default TrackingWebhookLog;
