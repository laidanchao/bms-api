import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';

@Entity('ord_parcel_label')
@Unique(['parcelId'])
export class ParcelLabel extends BasicEntity {
  @Column({ type: 'int4', nullable: false, unique: true })
  parcelId: number;

  @Column({ type: 'varchar', nullable: false })
  trackingNumber: string;

  @Column({ type: 'varchar', nullable: false })
  format: string;

  @Column({ type: 'varchar', nullable: false })
  path: string;

  @Column({ type: 'varchar', nullable: false })
  barcode: string;

  @OneToOne(type => Parcel)
  @JoinColumn({ name: 'parcel_id', referencedColumnName: 'id' })
  parcel: Parcel;
}
