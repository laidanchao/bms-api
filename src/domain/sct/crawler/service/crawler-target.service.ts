import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrawlerTarget, TRACK_AIM_STATUS } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlerTargetRepository } from '@/domain/sct/crawler/repository/crawler-target.repository';
import { In } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class CrawlerTargetService extends TypeOrmCrudService<CrawlerTarget> {
  constructor(@InjectRepository(CrawlerTargetRepository) private crawlerTargetRepository: CrawlerTargetRepository) {
    super(crawlerTargetRepository);
  }

  async update(options, crawlerTarget) {
    return await this.crawlerTargetRepository.update(options, crawlerTarget);
  }

  async bulkUpdate(crawlerTargetArray, updateColumns: string[]) {
    return await this.crawlerTargetRepository.bulkUpdate(crawlerTargetArray, updateColumns);
  }

  /**
   * 更新爬取次数
   * @param trackingNumberArray
   */
  async increaseCount(trackingNumberArray) {
    await this.crawlerTargetRepository.increaseCount(trackingNumberArray);
    await this.updateActive(trackingNumberArray);
  }

  /**
   * 更新包裹执行状态
   * @param trackingNumberArray
   */
  async updateActive(trackingNumberArray?: string[]) {
    return await this.crawlerTargetRepository.updateActive(trackingNumberArray);
  }

  async bulkInsert(crawlerTargetArray) {
    return await this.crawlerTargetRepository.bulkInsert(crawlerTargetArray);
  }

  async delete(options) {
    return await this.crawlerTargetRepository.delete(options);
  }

  // 更新target为false
  async updateCrawlerTarget(parcelArray) {
    if (_.isEmpty(parcelArray)) {
      return;
    }

    for (const chunkParcelArray of _.chunk(parcelArray, 2000)) {
      const trackingNumbers = chunkParcelArray.map(m => m.trackingNumber);
      const targets = await this.repo.find({
        where: {
          trackingNumber: In(trackingNumbers),
        },
      });

      targets.forEach(target => {
        const parcel = chunkParcelArray.find(f => f.trackingNumber === target.trackingNumber);
        if (parcel.transferredAt && target.trackAimStatus === TRACK_AIM_STATUS.IN_TRANSIT) {
          target.active = false;
          target.comment = `包裹已到目标状态[${TRACK_AIM_STATUS.IN_TRANSIT}]，停止抓取轨迹`;
        }

        if (parcel.arrivedAt && target.trackAimStatus === TRACK_AIM_STATUS.ARRIVED) {
          target.active = false;
          target.comment = `包裹已到目标状态[${TRACK_AIM_STATUS.ARRIVED}]，停止抓取轨迹`;
        }

        target.status = parcel.status;
      });

      await this.bulkUpdate(targets, ['active', 'comment', 'status']);
    }
  }
}
