import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { ParcelPushRequest } from '@/domain/npm/parcel-push/entity/parcel-push-request.entity';

@EntityRepository(ParcelPushRequest)
export class ParcelPushRequestRepository extends BaseRepository<ParcelPushRequest> {}
