import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity('sct_tracking_monitor')
export class TrackingMonitor extends BasicEntity {
  @Column({ type: 'date', comment: '当日', nullable: true })
  date: Date;

  @Column({ type: 'varchar', comment: '标识统计类别', nullable: true })
  type: TRACKING_MONITOR_TYPE;

  @Column({ type: 'varchar', comment: '派送商（每日一个派送商一行数据）', nullable: true })
  transporter: string;

  @Column({ type: 'int4', comment: '轨迹时效快的数量' })
  fastNum: number;

  @Column({ type: 'int4', comment: '轨迹时效中等的数量' })
  mediumNum: number;

  @Column({ type: 'int4', comment: '轨迹时效较慢的数量' })
  attentionNum: number;

  @Column({ type: 'int4', comment: '轨迹时效快的数量' })
  lateNum: number;

  @Column({ type: 'int4', comment: '轨迹时效快的数量' })
  totalNum: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: '时效快占总数比' })
  fastRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: '时效中等占总数比' })
  mediumRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: '时效较慢占总数比' })
  attentionRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: '时效慢占总数比' })
  lateRate: number;

  @Column({ type: 'varchar', comment: '时效为late的文件url' })
  lateFileUrl: number;
}

export enum TRACKING_MONITOR_TYPE {
  get = 'TRACKING_GET',
  push = 'TRACKING_PUSH',
}

export enum TRACKING_MONITOR_COLUMN {
  TRACKING_GET = 'timeDifference',
  TRACKING_PUSH = 'pushedTimeDifference',
}
