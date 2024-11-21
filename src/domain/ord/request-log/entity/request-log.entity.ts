import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { RequestStatusEnum } from '@/domain/ord/request-log/enum/requestStatus.enum';

@Entity('ord_request_log')
export class RequestLog extends BasicEntity {
  @Column('varchar', { comment: '平台发给cms的请求体' })
  requestBody: string;

  @Column('varchar', { comment: 'cms发给服务的请求', nullable: true })
  transporterRequest: string;

  @Column('varchar', { comment: '服务商返回的response', nullable: true })
  transporterResponse: string;

  @Column('varchar', { comment: '跟踪号' })
  trackingNumber: string;

  @Column('varchar', { comment: '供应商' })
  transporter: string;

  @Column('bigint', { comment: '花费的时间', nullable: true })
  elapsedTime: number;

  @Column('varchar')
  status: RequestStatusEnum;

  @Column('varchar')
  clientId: string;

  @Column('varchar')
  channel: string;

  @Column('varchar')
  platform: string;

  @Column('varchar')
  clientReference: string;

  @Column('varchar', { comment: '平台原始的请求体', nullable: true })
  applicationRequest: string;

  @Column('varchar', { comment: '平台日志id', nullable: true })
  traceId: string;

  @Column('varchar', { comment: 'cms报错', nullable: true })
  cmsError: string;

  @Column('varchar', { comment: '供应商报错', nullable: true })
  transporterError: string;
}
