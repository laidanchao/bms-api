import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { EventPushRequest } from '@/domain/npm/event-push/entity/event-push-request.entity';

export enum EventPushTaskStatus {
  'TO_BE_PUSHED' = 'TO_BE_PUSHED',
  'PUSHED' = 'PUSHED',
  'FAILED' = 'FAILED',
}

@Entity('npm_event_push_task')
export class EventPushTask extends BasicEntity {
  @Column('varchar', { comment: '平台' })
  platform: string;

  @Column('varchar', { comment: '客户' })
  client: string;

  @Column('varchar', { comment: '推送状态' })
  status: EventPushTaskStatus;

  @Column('int', { comment: '包裹数量' })
  parcelQuantity: number;

  @Column('varchar', { comment: '创建人' })
  createdBy: string;

  @Column('timestamptz', { comment: '推送时间' })
  pushedAt: Date;

  @OneToMany(
    () => EventPushRequest,
    detail => detail.task,
  )
  details: EventPushRequest[];
}
