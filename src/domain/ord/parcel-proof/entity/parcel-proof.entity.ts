import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

export enum TaskDetailStatus {
  'RUNNING' = 'RUNNING',
  'FAILED' = 'FAILED',
  'SUCCESS' = 'SUCCESS',
}

export enum ProofType {
  'POD' = 'POD', // POD签收证明
  'POW' = 'POW', // 重量截图
}

@Entity('ord_parcel_proof')
export class ParcelProof extends BasicEntity {
  @Column('varchar', { comment: '任务类型' })
  proofType: ProofType;

  @Column('varchar', { comment: '单号' })
  trackingNumber: string;

  @Column('varchar', { comment: '任务状态' })
  status: TaskDetailStatus;

  @Column('varchar', { comment: '尾程供应商' })
  lastmileProvider: string;

  @Column('varchar', { comment: '平台' })
  platform: string;

  @Column('varchar', { comment: '创建人' })
  createdBy: string;

  @Column('varchar', { comment: '客户id' })
  clientId: string;

  @Column('varchar', { comment: '语言' })
  language: string;

  @Column('varchar', { comment: 'S3保存路径' })
  filePath: string;

  @Column('varchar', { comment: '文件URL' })
  fileUrl: string;

  @Column('varchar', { comment: '任务失败原因' })
  failReason: string;
}
