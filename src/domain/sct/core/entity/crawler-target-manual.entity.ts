import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Entity('sct_crawler_target_manual')
export class CrawlerTargetManual extends BasicEntity {
  @Column({ type: 'varchar' })
  trackingNumber: string;

  @Column({ type: 'varchar' })
  shippingNumber: string;

  @Column({ type: 'varchar' })
  transporter: string;

  @Column({ type: 'varchar' })
  transporterSite: string;

  @Column('varchar', { comment: '账号' })
  transporterAccountId: string;

  @Column({ type: 'varchar' })
  filePath: string;

  @Column({ type: 'varchar' })
  status: TARGET_MANUAL_STATUS;

  @Column({ type: 'varchar' })
  failReason: string;

  @Column({ type: 'varchar' })
  receiverPostalCode: string;

  // 数字越小优先级越高
  @Column({ type: 'int' })
  sort: number;
}

export enum TARGET_MANUAL_STATUS {
  'READY' = 'READY',
  'RUNNING' = 'RUNNING',
  'SUCCESS' = 'SUCCESS',
  'FAILED' = 'FAILED',
}
