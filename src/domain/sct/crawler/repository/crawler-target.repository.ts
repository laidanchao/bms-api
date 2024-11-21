import { EntityRepository, In } from 'typeorm';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';

@EntityRepository(CrawlerTarget)
export class CrawlerTargetRepository extends BaseRepository<CrawlerTarget> {
  async filterActiveTrackingNumber(trackingNumbers) {
    if (!trackingNumbers || trackingNumbers.length) {
      return [];
    }
    return this.createQueryBuilder()
      .select()
      .where({ trackingNumber: In(trackingNumbers) })
      .andWhere('flag = :flag', { flag: false })
      .getMany();
  }

  // 按status过滤后的包裹
  async updateByTrackingNumbers(trackingNumbers, values) {
    if (!trackingNumbers || trackingNumbers.length) {
      return;
    }
    return this.createQueryBuilder()
      .update()
      .set(values)
      .where({ trackingNumber: In(trackingNumbers) })
      .execute();
  }

  async increaseCount(trackingNumbers) {
    if (!trackingNumbers || !trackingNumbers.length) {
      return;
    }
    await this.createQueryBuilder()
      .update()
      .set({
        count: () => 'count + 1',
        lastCrawlTime: new Date(),
      })
      .where({ trackingNumber: In(trackingNumbers) })
      .execute();
  }

  /**
   * 更新所有爬取次数超过限定的包裹任务为不活跃
   */
  async updateActive(trackingNumbers?: string[]) {
    const where: any = { active: true };
    if (trackingNumbers) {
      where.trackingNumber = In(trackingNumbers);
    }
    return await this.createQueryBuilder()
      .update()
      .set({
        active: false,
        comment: () =>
          `CONCAT('从 ',"created_at",' 至今共抓取轨迹',"count",'次，包裹仍未送达状态为 ',"status",'。停止抓取轨迹')`,
      })
      .where(where)
      .andWhere('count >= max_count')
      .execute();
  }

  async removeDeprecatedCrawlerTarget(planDays: number) {
    await this.manager.query(`
      DELETE
      FROM
      sct_crawler_target
      WHERE
      file_path IN ( SELECT file_path FROM sct_crawler_plan WHERE created_at < NOW() :: TIMESTAMP + '-${planDays} day' GROUP BY file_path )
    `);
  }
}
