import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable, Logger } from '@nestjs/common';
import { CrawlerService } from '@/domain/sct/crawler/service/crawler.service';

/**
 * 执行主动抓取轨迹的任务 一次执行一条任务
 * 与 {@link CrawlerPlanManagerJob} 配合使用
 *
 * @author keminfeng
 */
@Injectable()
export class CrawlerPlanExecutorJob extends NormalJob {
  constructor(
    private readonly crawlerService: CrawlerService,
  ) {
    super();
  }

  async execute(option?): Promise<void> {
    // Logger.log(`${this.constructor.name} has been called`);
    this.handle(option)
      .then(() => {
        // 打印成功日志
        // 钉钉机器人发送执行成功提示
        // 邮件发送执行结果详情
        // Logger.log(`${this.constructor.name} execute finish!!!`);
      })
      .catch(reason => {
        // 打印失败日志
        // 钉钉机器人发送执行失败提示
        // 邮件发送执行结果详情
        Logger.log(`${this.constructor.name} execute fail, reason: ${reason}`);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async handle(option?): Promise<any> {

    return this.crawlerService.execute(option);
  }
}
