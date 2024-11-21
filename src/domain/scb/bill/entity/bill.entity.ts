import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { BillSurchargeEntity } from '@/domain/scb/bill/entity/bill-surcharge.entity';
import { InvoiceLog } from '@/domain/scb/invoice-log/entities/invoice-log.entity';

@Entity('scb_bill')
export class Bill extends BasicEntity {
  @Column('varchar', { comment: '派送商账单发票号' })
  invoiceNumber: string;

  @Column('varchar', { comment: '派送商账单月' })
  month: string;

  @Column('varchar', { comment: '年份' })
  year: string;

  @Column('varchar', { comment: '平台' })
  platform: string;

  @Column('varchar', { comment: '派送商' })
  transporterId: string;

  @Column('varchar', { comment: '派送商账号' })
  transporterAccountId: string;

  @Column('numeric', { comment: '总金额' })
  amount: number;

  @Column('numeric', { nullable: true })
  ht: number;

  @Column('numeric', { nullable: true })
  vat: number;

  @Column('numeric', { comment: '赔偿金', nullable: true })
  indemnity: number;

  @Column('numeric', { comment: '额外费总金额', nullable: true })
  extraFee: number;

  @Column('numeric', { comment: '提货费' })
  pickupFee: number;

  @Column('numeric', { comment: '折扣费', nullable: true })
  discount: number;

  @Column('json', { comment: '账单中有偏差的费用', nullable: true })
  diffFee: Record<string, number>;

  @Column('numeric', { comment: '派送费' })
  shippingFee: number;

  @Column('numeric', { comment: '减去remise后的派送费', nullable: true })
  shippingFeeAfterRemise: number;

  @Column('numeric', { default: 0.0, comment: '燃油费' })
  fuelFee: number;

  @Column('numeric', { comment: '包裹总重量', nullable: true })
  totalWeight: number;

  @Column('numeric', { comment: '包裹总数量', nullable: true })
  parcelQuantity: number;

  @Column('varchar', { comment: '线路', nullable: true })
  routeId: string;

  @Column('varchar', { comment: '账单明细url存储路径', nullable: true })
  detailFileUrl: string;

  @Column('varchar', { comment: '发送给平台的账单明细' })
  fileForApplication: string;

  @Column('int4', { comment: '关联源账单id' })
  invoiceId: number;

  @OneToMany(
    () => BillDetail,
    detail => detail.bill,
  )
  details: BillDetail[];

  @OneToMany(
    () => BillSurchargeEntity,
    extraFee => extraFee.bill,
  )
  extraFees: BillSurchargeEntity[];

  @OneToOne(
    type => InvoiceLog,
    invoiceLog => invoiceLog.bill,
  )
  invoiceLog: InvoiceLog;

  constructor(
    invoiceNumber: string,
    month: string,
    year: string,
    platform: string,
    transporterId: string,
    transporterAccountId: string,
    amount: number,
    ht: number,
    vat: number,
    indemnity: number,
    extraFee: number,
    pickupFee: number,
    discount: number,
    diffFee: Record<string, number>,
    shippingFee: number,
    shippingFeeAfterRemise: number,
    fuelFee: number,
    totalWeight: number,
    parcelQuantity: number,
    routeId: string,
    detailFileUrl: string,
    fileForApplication: string,
    invoiceId: number,
  ) {
    super();
    this.invoiceNumber = invoiceNumber;
    this.month = month;
    this.year = year;
    this.platform = platform;
    this.transporterId = transporterId;
    this.transporterAccountId = transporterAccountId;
    this.amount = amount;
    this.ht = ht;
    this.vat = vat;
    this.indemnity = indemnity;
    this.extraFee = extraFee;
    this.pickupFee = pickupFee;
    this.discount = discount;
    this.diffFee = diffFee;
    this.shippingFee = shippingFee;
    this.shippingFeeAfterRemise = shippingFeeAfterRemise;
    this.fuelFee = fuelFee;
    this.totalWeight = totalWeight;
    this.parcelQuantity = parcelQuantity;
    this.routeId = routeId;
    this.detailFileUrl = detailFileUrl;
    this.fileForApplication = fileForApplication;
    this.invoiceId = invoiceId;
  }
}
