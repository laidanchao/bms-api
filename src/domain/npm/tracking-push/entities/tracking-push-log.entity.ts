import { AfterUpdate, Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import moment from 'moment';

export enum TrackingPushStatus {
  READY = 'READY',
  SUCCESS = 'SUCCESS',
}

// 轨迹推送日志表
@Entity('npm_tracking_push_log')
export class TrackingPushLog extends BasicEntity {
  @Column({ type: 'varchar' })
  transporterId: string;
  @Column({ type: 'varchar' })
  platform: string;
  @Column({ type: 'varchar', nullable: true })
  clientId: string;
  @Column({ type: 'varchar' })
  status: TrackingPushStatus;
  @Column({ type: 'varchar' })
  trackingNumber: string;
  @Column({ type: 'varchar' })
  event: string;
  @Column({ type: 'varchar' })
  timestamp: Date;
  @Column({ type: 'varchar', nullable: true })
  description: string;
  @Column({ type: 'varchar', nullable: true })
  location: string;
  @Column({ type: 'bool' })
  fromFile: boolean;
  @Column({ type: 'varchar', nullable: true })
  fileName: string;
  @Column({ type: 'int' })
  trackingId: number;
  @Column({ type: 'varchar', nullable: true })
  reference: string;

  @Column({ comment: '该条轨迹的推送成功的时间' })
  pushedAt: Date;

  @Column({ comment: 'pushed_at-timestamp,便于监控轨迹推送的延迟情况' })
  pushedTimeDifference: number;

  @Column({ comment: '仅针对FTP获取到的轨迹存该份文件的获取时间,与sct_tracking表保持一致' })
  getFileTime: Date;

  @Column('int8', { comment: '派送商给文件的延后时间，与sct_tracking表保持一致' })
  transporterDelayTime: number;
}

export default TrackingPushLog;
