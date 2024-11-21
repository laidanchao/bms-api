import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, Unique } from 'typeorm';

/**
 * 物流平台
 */
export enum WEBHOOK_SOURCE {
  '17TRACK' = '17TRACK',
  'DELIVENGO' = 'DELIVENGO',
  'COLISSIMO' = 'COLISSIMO',
  'COLICOLI' = 'COLICOLI',
  'CAINIAO' = 'CAINIAO',
}

/**
 * 注册状态
 */
export enum RegisterStatus {
  'READY' = 'READY',
  'SUCCESS' = 'SUCCESS',
  'FAILED' = 'FAILED',
}

// 物流单号注册表
@Entity({
  name: 'sct_17track_request',
})
@Unique(['trackingNumber'])
export class Track17Request extends BasicEntity {
  @Column({ comment: '物流单号' })
  trackingNumber: string;
  @Column({ comment: '注册时间', nullable: true })
  registeredAt?: Date;
  @Column({ comment: '停止跟踪时间', nullable: true })
  stopAt?: Date;
  @Column({ comment: '重启跟踪时间', nullable: true })
  retryAt?: Date;
  @Column({ comment: '是否已经停止跟踪' })
  isStopped: boolean;
  @Column({ comment: '注册状态' })
  registerStatus: RegisterStatus;
  @Column({ comment: '注册次数' })
  registerCount: number;
  @Column({ comment: '注册失败原因' })
  registerFailedReason?: string;
  @Column({ comment: '平台' })
  platform: string;
  @Column({ comment: '收件邮编' })
  receiverPostalCode: string;
  @Column({ name: 'carrier_code_17track', comment: '17track承运商code' })
  carrierCode17track: string;
}
