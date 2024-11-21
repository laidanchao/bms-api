import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import moment from 'moment';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import _ from 'lodash';

/**
 * 收集需要注册的物流单号
 */
@Injectable()
export class CrawlerPlanDailyReportJob extends NormalJob {
  constructor(private xPushService: XPushService) {
    super();
  }

  async handle(options): Promise<any> {
    try {
      // const date =
      //   options?.date ||
      //   moment()
      //     .subtract(1, 'days')
      //     .format('YYYY-MM-DD');
      const currentHour = moment().hours();
      let date = (currentHour < 5 ? moment().subtract(1, 'days') : moment()).format('YYYY-MM-DD');
      if (options?.date) {
        date = options.date;
      }

      const queryRunner = getConnection().createQueryRunner();
      const crawlerPlans = await queryRunner.query(`
        select transporter,file_path,max(result) result,min(status) status
        from sct_crawler_plan
        where date(schedule)='${date}' GROUP BY transporter,file_path
      `);

      const head = `## 轨迹爬取监控 ${date}  \n  |线路|包裹总数|已结束|未结束|成功获取轨迹包裹数|  \n  |-|-|-|-|-|  \n  `;
      const body = _.chain(crawlerPlans)
        .groupBy('transporter')
        .mapValues(items => {
          return items.reduce(
            (accumulator, plan) => {
              const result = plan.result.split('/').map(x => Number(x));
              return {
                transporter: plan.transporter,
                total: accumulator.total + result[2],
                active: accumulator.active + result[1],
                success: accumulator.success + result[0],
              };
            },
            { total: 0, active: 0, success: 0 },
          );
        })

        .map(
          item =>
            `|${item.transporter}|${item.total}|${item.total - item.active}|${item.active}|${
              item.success === 0 ? '**<font color="#FF5151">0</font>**' : item.success
            }|`,
        )
        .join('  \n  ')
        .value();
      const contentStr = head + body;
      this.xPushService.sendDingDing(contentStr, 'tracking').then();
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService
        .sendDingDing(`CrawlerPlanDailyReportJob 出现异常，异常信息: ${e.message}|${e.stack}`, 'tracking')
        .then();
    }
  }
}
