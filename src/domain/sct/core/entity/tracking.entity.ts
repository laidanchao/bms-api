import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';

@Entity({
  name: 'sct_tracking_hot',
})
@Unique(['trackingNumber', 'description', 'timestamp'])
export class Tracking extends BasicEntity {
  @Column('varchar', { comment: '跟踪单号' })
  @ManyToOne(
    () => Parcel,
    parcel => parcel.trackingNumber,
  )
  @JoinColumn({ name: 'tracking_number', referencedColumnName: 'trackingNumber' })
  trackingNumber: string;
  @Column('varchar', { comment: '客户单号', nullable: true })
  reference?: string;
  @Column('varchar', { comment: '跟踪事件' })
  event: string;
  @Column({ comment: '跟踪事件时间' })
  timestamp: Date;
  @Column('text', { comment: '跟踪事件描述', nullable: true })
  description?: string;
  @Column('varchar', { comment: '跟踪时间所在位置', nullable: true })
  location?: string;
  @Column('varchar', { comment: '跟踪文件名称', default: '' })
  fileName?: string;
  @Column('boolean', { comment: '是否来自文件的标记', default: false })
  fromFile?: boolean;

  @Column('varchar', { comment: '派送商' })
  transporter: string;

  @Column('int8', { comment: 'created_at减timestamp(min)' })
  timeDifference: number;

  @Column({ comment: '仅针对FTP获取到的轨迹存该份文件的获取时间' })
  getFileTime: Date;

  @Column('int8', { comment: '计算派送商给文件的延后时间 get_file_time-timestamp' })
  transporterDelayTime: number;
}
