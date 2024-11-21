import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { EventPushTask } from '@/domain/npm/event-push/entity/event-push-task.entity';

// 节点推送状态
export enum EventPushStatus {
  TO_BE_PUSHED = 'TO_BE_PUSHED',
  PUSHED = 'PUSHED',
  FAILED = 'FAILED',
}

// 事件代码
export enum EventCode {
  COM_CLI = 'COM_CLI',
}

// 事件推送申请表
@Entity({
  name: 'npm_event_push_request',
})
@Unique(['trackingNumber', 'eventCode'])
export class EventPushRequest extends BasicEntity {
  @IsString()
  @Column({ type: 'varchar', name: 'tracking_number', comment: '跟踪单号' })
  @ManyToOne(
    () => Parcel,
    parcel => parcel.trackingNumber,
  )
  @JoinColumn({ name: 'tracking_number', referencedColumnName: 'trackingNumber' })
  trackingNumber: string;

  @IsEnum(EventCode)
  @Column({ enum: EventCode, name: 'event_code', comment: '事件代码' })
  eventCode: EventCode;

  @IsDate()
  @Column({ type: 'timestamptz', name: 'event_time', comment: '事件发生时间' })
  eventTime: Date;

  @Column({ comment: '推送状态', enum: EventPushStatus, default: 'NOT_PUSHED' })
  status: EventPushStatus;

  @Column({ comment: '平台id' })
  platform: string;

  @Column({ comment: '任务id' })
  taskId: number;

  @Column({ comment: '失败原因' })
  failedReason: string;

  @ManyToOne(
    () => EventPushTask,
    task => task.details,
  )
  @JoinColumn({ name: 'task_id' })
  task: EventPushTask;
}
