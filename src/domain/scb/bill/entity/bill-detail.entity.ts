import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';

@Entity('scb_bill_detail_hot')
export class BillDetail extends BasicEntity {
  @Column('varchar', { comment: '派送商账单发票号' })
  invoiceNumber: string;

  @Column('varchar', { comment: '包裹跟踪号' })
  trackingNumber: string;

  @Column('varchar', { comment: '包裹派送号' })
  shippingNumber: string;

  @Column('varchar', { comment: '派送商账号' })
  transporterAccountId: string;

  @Column('numeric', { comment: '包裹实际重量' })
  weight: number;

  @Column('numeric', { comment: '包裹重量区间', nullable: true })
  weightRange: number;

  @Column('numeric', { comment: '包裹检测称重重量', nullable: true })
  roughWeight: number;

  @Column('varchar', { nullable: true })
  countryCode: string;

  @Column('varchar', { comment: '包裹地区分布', nullable: true })
  regionRange: string;

  @Column('varchar')
  route: string;

  @Column('varchar', { comment: '收件人邮编', nullable: true })
  postalCode: string;

  @Column('numeric')
  vat: number;

  @Column('numeric', { comment: '包裹派送费' })
  shippingFee: number;

  @Column('numeric', { comment: '减去remise后的派送费' })
  shippingFeeAfterRemise: number;

  @Column('numeric', { comment: '燃油费' })
  fuelFee: number;

  @Column('numeric', { comment: '额外费' })
  extraFee: number;

  @Column('numeric', { name: 'pickup_fee', comment: '额外费' }) putSign;
  pickupFee: number;

  @Column('json', { default: '{}', comment: '额外费明细', nullable: true })
  extraFeeDetail: Record<string, number> = {};

  @Column('numeric', { comment: '额外费，D类额外费时，当单号以6G开头，则把D类金额存成6€' })
  extraFeeMinus: number;

  @Column('json', { default: '{}', comment: '额外费明细，当单号以6G开头，则把D类金额存成6€', nullable: true })
  extraFeeDetailMinus: Record<string, number> = {};

  @Column('timestamp with time zone', { comment: '收费时间', nullable: true })
  invoicedAt: Date;

  @Column('numeric', { comment: '对应账单ID', nullable: true })
  billId: number;

  @Column('varchar', { comment: '体积重量标识', nullable: true })
  weightType: string;

  @Column('varchar', { comment: '产品', nullable: true })
  product: string;

  @Column('varchar', { nullable: true })
  receiveCountryCode: string;

  @ManyToOne(
    () => Bill,
    bill => bill.details,
  )
  bill: Bill;

  constructor(
    invoiceNumber: string,
    trackingNumber: string,
    shippingNumber: string,
    transporterAccountId: string,
    weight: number,
    weightRange: number,
    roughWeight: number,
    countryCode: string,
    regionRange: string,
    route: string,
    postalCode: string,
    vat: number,
    shippingFee: number,
    shippingFeeAfterRemise: number,
    fuelFee: number,
    extraFee: number,
    extraFeeDetail: Record<string, number>,
    invoicedAt: Date,
    product?: string,
    receiveCountryCode?: string,
  ) {
    super();
    this.invoiceNumber = invoiceNumber;
    this.trackingNumber = trackingNumber;
    this.shippingNumber = shippingNumber;
    this.transporterAccountId = transporterAccountId;
    this.weight = weight;
    this.weightRange = weightRange;
    this.roughWeight = roughWeight;
    this.countryCode = countryCode;
    this.regionRange = regionRange;
    this.route = route;
    this.postalCode = postalCode;
    this.vat = vat;
    this.shippingFee = shippingFee;
    this.shippingFeeAfterRemise = shippingFeeAfterRemise;
    this.fuelFee = fuelFee;
    this.extraFee = extraFee;
    this.extraFeeDetail = extraFeeDetail;
    this.invoicedAt = invoicedAt;
    this.product = product || null;
    this.receiveCountryCode = receiveCountryCode || null;
  }
}
