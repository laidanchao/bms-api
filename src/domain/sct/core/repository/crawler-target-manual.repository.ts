import { CrawlerTargetManual } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { EntityRepository } from 'typeorm';

@EntityRepository(CrawlerTargetManual)
export class CrawlerTargetManualRepository extends BaseRepository<CrawlerTargetManual> {}
