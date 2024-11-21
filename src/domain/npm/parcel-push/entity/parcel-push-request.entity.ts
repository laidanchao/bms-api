import { Column, Entity, Index } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Entity('npm_parcel_push_request')
export class ParcelPushRequest extends BasicEntity {
  @Column({ type: 'varchar', nullable: true })
  platform: string;

  @Index()
  @Column('varchar')
  trackingNumber: string;

  @Column({ type: 'varchar', nullable: true })
  shippingNumber: string;

  @Column('varchar')
  transporter: string;

  @Column('timestamp with time zone')
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
  lastEvent: string;

  @Column('varchar', { nullable: true })
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

  @Column('varchar', { nullable: true, default: 'INIT' })
  syncStatus: string;

  @Index()
  @Column('varchar')
  uuId: string;

  @Column('int', { nullable: true })
  supplierWeight: number;
}
