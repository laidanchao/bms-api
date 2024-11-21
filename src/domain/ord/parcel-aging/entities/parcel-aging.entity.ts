import { Column, Entity, Unique } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';

@Unique('parcel_aging_trackingNumber_UK', ['trackingNumber'])
@Entity('sts_parcel_aging_hot')
export class ParcelAging extends BasicEntity {
  @Column({ type: 'varchar', nullable: false })
  trackingNumber: string;

  @Column({ type: 'varchar', nullable: false })
  transporterId: string;

  @Column({ type: 'varchar', nullable: true })
  transporterAccountId: string;

  @Column({ type: 'varchar', nullable: true })
  channel: string;

  @Column({ type: 'varchar', nullable: true })
  productCode: string;

  @Column({ type: 'varchar', nullable: true })
  platform: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  parcelCreatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  transferredAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  arrivedAt: Date;

  @Column({ type: 'float', nullable: false })
  transferredAging: number;

  @Column({ type: 'float', nullable: false })
  arrivedAging: number;

  @Column({ type: 'varchar', nullable: false })
  status: string;

  @Column({ type: 'float', nullable: false })
  sourceDeliveryAging: number;

  @Column({ type: 'boolean', nullable: false })
  transferredAtIsSunday: boolean;

  @Column({ type: 'boolean', nullable: false })
  arrivedAtIsSunday: boolean;
}
