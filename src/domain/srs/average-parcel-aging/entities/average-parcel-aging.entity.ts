import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'sts_average_parcel_aging',
})
export class AverageParcelAging extends BasicEntity {
  @Column({ type: 'timestamptz' })
  date: Date;
  @Column({ type: 'varchar', default: 'UNKNOWN' })
  transporterId: string;
  @Column({ type: 'varchar', default: 'UNKNOWN' })
  transporterAccountId: string;
  @Column({ type: 'varchar', default: 'UNKNOWN' })
  platform: string;
  @Column({ type: 'varchar', default: 'UNKNOWN' })
  productCode: string;
  @Column({ type: 'varchar', default: 'UNKNOWN' })
  channel: string;
  @Column({ type: 'float8', nullable: true })
  averageTransferredAging: number;
  @Column({ type: 'float8', nullable: true })
  averageArrivedAging: number;
}
