import { Entity } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';

@Entity('ord_parcel')
export class ParcelAll extends Parcel {}
