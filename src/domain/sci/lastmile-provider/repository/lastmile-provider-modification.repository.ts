import { BaseRepository } from '@/domain/base/repository/base.repository';
import { EntityRepository } from 'typeorm';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';

@EntityRepository(LastmileProviderModification)
export class LastmileProviderModificationRepository extends BaseRepository<LastmileProviderModification> {}
