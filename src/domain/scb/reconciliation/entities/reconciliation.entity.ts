import { Column, Entity, OneToMany } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { ReconciliationDetail } from './reconciliation-detail.entity';

@Entity({
  name: 'scb_reconciliation',
})
// 对账记录表
export class Reconciliation extends BasicEntity {
  @Column({
    name: 'transporter_id',
    comment: '派送商',
  })
  transporterId: string;

  @Column({
    name: 'file_path',
    comment: 's3保存路径',
  })
  filePath: string;

  @Column({
    name: 'file_url',
    comment: '文件url',
  })
  fileUrl: string;

  @Column({
    name: 'month',
    comment: '账单月份',
  })
  yearMonth: string;

  @Column({
    name: 'product_codes',
    comment: '产品码数组',
    type: 'simple-array',
  })
  productCodes: string[];

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
    name: 'total',
    comment: '总条数',
  })
  total: number;

  @Column({
    comment: '成功条数',
  })
  success: number;

  @Column({
    comment: '失败条数',
  })
  failed: number;

  @Column({
    name: 'is_finished',
    comment: '是否已完成对账',
  })
  isFinished: boolean;

  @OneToMany(
    type => ReconciliationDetail,
    detail => detail.reconciliation,
  )
  details: ReconciliationDetail[];
}
