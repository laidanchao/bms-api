import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { ParcelPushLog } from '@/domain/npm/parcel-push/entity/parcel-push-log.entity';

@EntityRepository(ParcelPushLog)
export class ParcelPushLogRepository extends BaseRepository<ParcelPushLog> {}
