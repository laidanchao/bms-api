import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'tracking_number_pool',
  synchronize: true,
})
export class TrackingNumberPool extends BasicEntity {
  @Column({ nullable: false, name: 'tracking_number', unique: true })
  trackingNumber: string;
}
