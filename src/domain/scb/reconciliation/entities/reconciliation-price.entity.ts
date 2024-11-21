import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Entity({
  name: 'scb_reconciliation_price',
})
// 成本价格表
export class ReconciliationPrice extends BasicEntity {
  @Column({
    name: 'transporter_id',
    comment: '派送商',
  })
  transporterId: string;

  @Column({
    name: 'product_codes',
    comment: '产品码',
    type: 'simple-array',
  })
  productCodes: string[];

  @Column({
    name: 'zones',
    comment: '收件国集合',
    type: 'simple-array',
  })
  zones: string[];

  @Column({
    type: 'numeric',
    name: 'weight_range',
    comment: '重量段',
  })
  weightRange: number;

  @Column({
    type: 'numeric',
    name: 'unit_price',
    comment: '单价',
  })
  unitPrice: number;
}
