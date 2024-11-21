import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Reconciliation } from './reconciliation.entity';

@Entity({
  name: 'scb_reconciliation_detail',
})

// 对账记录明细表
export class ReconciliationDetail extends BasicEntity {
  @Column({
    name: 'bill_reconcile_id',
    comment: '对账单记录id',
  })
  billReconcileId: number;

  @Column({
    name: 'transporter_account_id',
    comment: '派送商账号',
  })
  transporterAccountId: string;

  @Column({
    name: 'product_code',
    comment: '产品码',
  })
  productCode: string;

  @Column({
    name: 'country_code',
    comment: '国家编号',
  })
  countryCode: string;

  @Column({
    type: 'numeric',
    name: 'weight_range',
    comment: '重量段',
  })
  weightRange: number;

  @Column({
    name: 'parcel_quantity',
    comment: '包裹数',
  })
  parcelQuantity: number;

  @Column({
    type: 'numeric',
    name: 'unit_price',
    comment: '单价',
  })
  unitPrice: number;

  @Column({
    type: 'numeric',
    name: 'payable_shipping_fee',
    comment: '应收折后运费',
  })
  payableShippingFee: number;

  @Column({
    type: 'numeric',
    name: 'payable_fuel_fee',
    comment: '应收燃油费',
  })
  payableFuelFee: number;

  @Column({
    type: 'numeric',
    name: 'actual_shipping_fee',
    comment: '实收折后运费',
  })
  actualShippingFee: number;

  @Column({
    type: 'numeric',
    name: 'actual_fuel_fee',
    comment: '实收燃油费',
  })
  actualFuelFee: number;

  @Column({
    name: 'is_error',
    comment: '是否有错误',
  })
  isError: boolean;

  @Column({
    name: 'line_number',
    comment: '行号',
  })
  lineNumber: number;

  @Column({
    name: 'error_message',
    comment: '错误内容',
  })
  errorMessage: string;

  @ManyToOne(type => Reconciliation)
  @JoinColumn({ name: 'bill_reconcile_id', referencedColumnName: 'id' })
  reconciliation: Reconciliation;
}
