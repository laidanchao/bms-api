import { Entity } from 'typeorm';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';

@Entity({
  name: 'sct_tracking',
})
export class TrackingAll extends Tracking {}
