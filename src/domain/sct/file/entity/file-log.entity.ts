import { Column, Entity, Index } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Index('event_referenceId_resourceName_IDX', ['referenceId', 'resourceName'])
@Entity({ name: 'sct_file_log' })
export class FileLog extends BasicEntity {
  @Column('varchar', { comment: '资源名' })
  resourceName: string;
  @Column('varchar', { comment: '事件名' })
  event: string;
  @Column('int', { comment: '关联ID' })
  referenceId: number;
  @Column('bigint', { comment: '花费的时间', nullable: true })
  elapsedTime: number;
}
