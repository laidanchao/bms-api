import { EntityRepository } from 'typeorm';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';

@EntityRepository(Track17Request)
export class Track17RequestRepository extends BaseRepository<Track17Request> {}
