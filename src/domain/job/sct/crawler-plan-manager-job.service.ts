import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { CrawlerProcessService } from '@/domain/job/sct/service/crawler-process.service';
import moment from 'moment/moment';
/**
 * 为每天产生的包裹创建主动抓取轨迹的任务
 * 交给 {@link CrawlerPlanExecutorJob} 执行
 *
 * 同时负责对超时任务的重置
 * 以及对过期任务包裹进行移除
 *
 * @author keminfeng
 */
@Injectable()
export class CrawlerPlanManagerJob extends NormalJob {
  constructor(private readonly crawlerProcessService: CrawlerProcessService) {
    super();
  }

  protected async handle(option?): Promise<any> {
    // 每天将超过最大次数的target active 设为false
    if (option && option.type === 'DAILY_MAX_COUNT_NO_ACTIVE') {
      await this.crawlerProcessService.setCrawlerTargetInactive();
    }
    // 每6个小时收集一次包裹
    if (option && option.type === 'COLLECT_PARCEL') {
      await this.crawlerPlanManage(option?.date, option?.startTime, option?.endTime, option?.notCollected || false);
    }
    // 每小时重置执行超时的任务 设置状态为 READY
    if (option && option.type === 'HOURLY') {
      await this.hourlyCrawlerPlanManage();
    }
    if (option && option.type === 'CHECK_BEFORE_YESTERDAY') {
      await this.crawlerProcessService.checkBeforeYesterdayPlan();
    }
  }

  private async crawlerPlanManage(date, startTime, endTime, notCollected) {
    if (startTime && endTime) {
    } else if (date) {
      startTime = moment(date)
        .subtract(6, 'hours')
        .subtract(30, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
      endTime = moment(date)
        .subtract(30, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
    } else {
      if (notCollected) {
        startTime = moment()
          .subtract(1, 'day')
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
        endTime = moment()
          .subtract(1, 'day')
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        startTime = moment()
          .subtract(6, 'hours')
          .subtract(30, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
        endTime = moment()
          .subtract(30, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
      }
    }

    await this.crawlerProcessService.collectTrackingNumbersByDate(startTime, endTime, notCollected);
  }

  private async hourlyCrawlerPlanManage() {
    await this.crawlerProcessService.resetTimeoutPlanJobStatus();
  }
}
