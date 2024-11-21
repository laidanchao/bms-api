import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Entity('sct_crawler_target')
export class CrawlerTarget extends BasicEntity {
  @Column({ type: 'varchar' })
  trackingNumber: string;
  @Column({ type: 'varchar' })
  shippingNumber: string;
  @Column({ type: 'varchar' })
  status: string;
  @Column({ type: 'int4', default: 0 })
  count: number;
  @Column({ type: 'bool', default: true })
  active: boolean;
  @Column({ type: 'varchar' })
  filePath: string;
  @Column({ type: 'varchar' })
  comment?: string;
  @Column({ type: 'varchar' })
  transporter: string;
  @Column({ type: 'int4', name: 'max_count', default: 0 })
  maxCount: number;
  @Column('varchar', { comment: '账号的目标轨迹终点' })
  trackAimStatus: TRACK_AIM_STATUS;
  @Column('varchar', { comment: '账号' })
  transporterAccountId: string;
  @Column('varchar', { comment: '收件人邮编' })
  receiverPostalCode: string;
  @Column({ type: 'boolean', comment: '是否官方的' })
  official: boolean;
  @Column({ type: 'timestamptz', comment: '最后一次爬取时间' })
  lastCrawlTime: Date;
}

export enum TRACK_AIM_STATUS {
  'IN_TRANSIT' = 'IN_TRANSIT',
  'ARRIVED' = 'ARRIVED',
}
