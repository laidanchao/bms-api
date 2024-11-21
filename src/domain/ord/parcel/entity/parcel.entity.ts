import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { ParcelLabel } from '@/domain/ord/parcel/entity/parcel-label.entity';

@Entity('ord_parcel_hot')
@Unique(['trackingNumber'])
export class Parcel extends BasicEntity {
  @Column({ type: 'varchar', nullable: true })
  platform: string;

  @Column('varchar', { unique: true })
  trackingNumber: string;

  @OneToMany(
    () => Tracking,
    tracking => tracking.trackingNumber,
  )
  @JoinColumn({ name: 'tracking_number', referencedColumnName: 'trackingNumber' })
  trackings: Tracking[];

  @Column({ type: 'varchar', nullable: true })
  shippingNumber: string;

  @Column('varchar')
  transporter: string;

  @Column('varchar', { name: 'lastmile_provider', comment: '尾程供应商' })
  lastmileProvider: string;

  @Column({ type: 'timestamp with time zone' })
  declaredAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  transferredAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  arrivedAt: Date;

  @Column('varchar', { default: 'CREATED' })
  status: string;

  @Column('varchar', { nullable: true })
  error: string;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date;

  @Column('numeric', { nullable: true })
  aging: number;

  @Column('boolean', { nullable: true })
  isReturned: boolean;

  @Column('timestamp with time zone', { nullable: true })
  returnedAt: Date;

  @Column('varchar', { nullable: true })
  receiverCountryCode: string;

  @Column('varchar', { nullable: true })
  receiverPostalCode: string;

  @Column('varchar', { nullable: true })
  receiverCity: string;

  @Column('varchar', { nullable: true })
  lastEvent: string;

  @Column('text', { nullable: true })
  lastDescription: string;

  @Column('timestamp with time zone', { nullable: true })
  lastTimestamps: Date;

  @Column('boolean', { default: false, nullable: true })
  isArrived: boolean;

  @Column('boolean', { default: false, nullable: true })
  isLost: boolean;

  @Column('varchar', { nullable: true })
  clientId: string;

  @Column('boolean', { default: false })
  sync: boolean;

  @Column('varchar', { nullable: true })
  // 账号
  transporterAccountId: string;

  @Column('varchar', { nullable: true })
  channel: string;

  @Column('varchar', { default: 'v1' })
  apiVersion: string;

  @Column('float', { default: 0 })
  insuranceValue: number;

  @Column('int', { nullable: true })
  supplierWeight: number;

  @Column({ type: 'varchar', nullable: true })
  hubCode: string;

  @Column({ type: 'simple-array', comment: '包裹尺寸[长，宽，高]' })
  supplierDimension: number[];

  @Column({ type: 'varchar' })
  productCode: string;

  @Column({ type: 'boolean' })
  isAppointed: boolean; // 客户预约派送

  @Column({ type: 'varchar' })
  reference: string;

  @Column({ type: 'boolean' })
  isFinished: boolean; // 是否完结（轨迹是否完结）

  @OneToOne(
    type => ParcelLabel,
    label => label.parcel,
  )
  parcelLabel: ParcelLabel;
}
