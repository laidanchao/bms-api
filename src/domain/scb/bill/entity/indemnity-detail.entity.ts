import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity('scb_indemnity_detail')
export class IndemnityDetail extends BasicEntity {
  @Column('varchar', { nullable: true, comment: '包裹发票号' })
  invoiceNumber: string;

  @Column('varchar')
  month: string;

  @Column('varchar')
  platform: string;

  @Column('varchar')
  type: string;

  @Column('varchar', { comment: '包裹跟踪号' })
  trackingNumber: string;

  @Column('varchar')
  transporter: string;

  @Column('varchar', { nullable: true })
  transporterAccountId: string;

  @Column('numeric')
  value: number;

  @Column('boolean', { default: false })
  sync = false;

  @Column('int')
  billId: number;
}
