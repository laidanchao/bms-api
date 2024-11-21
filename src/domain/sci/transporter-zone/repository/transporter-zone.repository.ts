import { EntityRepository } from 'typeorm';
import { TransporterZone } from '@/domain/sci/transporter-zone/entity/transporter-zone.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';

@EntityRepository(TransporterZone)
export class TransporterZoneRepository extends BaseRepository<TransporterZone> {}
