import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';

@Entity('scb_invoice_log')
export class InvoiceLog extends BasicEntity {
  @Column('int')
  billTaskId: number;

  @Column('varchar')
  sourceFileName: string;

  @Column('varchar', { nullable: true })
  purchaseDetailUrl: string;

  @Column('varchar', { nullable: true })
  purchaseBillUrl: string;

  @Column('varchar', { nullable: true })
  indemnityUrl: string;

  @Column('varchar', { nullable: true })
  weightUrl: string;

  @Column('int')
  invoiceId: number;

  @Column('int')
  billId: number;

  @OneToOne(type => Bill)
  @JoinColumn({ name: 'bill_id', referencedColumnName: 'id' })
  bill: Bill;
}
