import { BaseRepository } from '@/domain/base/repository/base.repository';
import { CrawlerPlan } from '@/domain/sct/crawler/entity/crawler-plan.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(CrawlerPlan)
export class CrawlerPlanRepository extends BaseRepository<CrawlerPlan> {}
