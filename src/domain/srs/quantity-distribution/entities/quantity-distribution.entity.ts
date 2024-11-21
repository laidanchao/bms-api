import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity('sts_quantity_distribution')
export class QuantityDistribution extends BasicEntity {
  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ type: 'int4' })
  declaredQuantity: number;

  @Column({ type: 'int4' })
  transferredQuantity: number;

  @Column({ type: 'int4' })
  arrivedQuantity: number;

  @Column({ type: 'varchar' })
  transporter: string;

  @Column({ type: 'varchar' })
  platform: string;

  @Column({ type: 'varchar' })
  transporterAccountId: string;

  @Column({ type: 'varchar' })
  channel: string;

  @Column({ type: 'varchar' })
  clientId: string;

  @Column({ type: 'varchar' })
  trackingNumberPrefix: string;
}
