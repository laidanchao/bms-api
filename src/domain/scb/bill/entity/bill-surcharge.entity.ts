import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';

@Entity('scb_bill_surcharge')
export class BillSurchargeEntity extends BasicEntity {
  @Column('varchar', { comment: '额外费用名称' })
  name: string;

  @Column('numeric', { comment: '额外费金额' })
  amount: number;

  @Column('numeric', { comment: '费用金额占比' })
  amountPercentage: number;

  @Column('numeric', { comment: '包裹数量', nullable: true })
  quantity: number;

  @Column('numeric', { comment: '包裹个数占比' })
  quantityPercentage: number;

  @Column('int4', { comment: '账单id' })
  billId: number;

  @ManyToOne(
    () => Bill,
    bill => bill.id,
  )
  bill: number;
}
