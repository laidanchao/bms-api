import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable, Logger } from '@nestjs/common';
import { getRepository, In } from 'typeorm';
import { CrawlerPlan } from '@/domain/sct/crawler/entity/crawler-plan.entity';
import _ from 'lodash';
import moment from 'moment';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { CrawlerProcessService } from '@/domain/job/sct/service/crawler-process.service';

/**
 * 将包裹数量少（激活中的）的计划合并
 */
@Injectable()
export class CrawlerPlanMergeJob extends NormalJob {
  constructor(private readonly crawlerProcessService: CrawlerProcessService) {
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

  /**
   * 合并爬虫计划
   * 1. 获取需要合并的计划（待爬取的、非官方接口的、指定派送商的）
   * 2. 按平台分组获取计划明细
   * 3. 生成新计划并修改计划明细的file_path
   * 4. 更新旧计划为DONE
   * @param option
   * @protected
   */
  protected async handle(option): Promise<any> {
    const { transporter, official = false } = option;

    // 1. 获取需要合并的计划（待爬取的、非官方接口的、指定派送商的）
    const plans = await getRepository(CrawlerPlan).find({
      where: {
        transporter,
        official,
        status: 'READY',
      },
    });
    console.log(`${transporter}共${plans.length}个计划将被合并`);

    const platformGroup = _.groupBy(plans, 'platform');
    for (const platform in platformGroup) {
      const appGroupPlans = platformGroup[platform];
      const filePaths = _.chain(appGroupPlans)
        .map('filePath')
        .uniq()
        .value();
      const schedulesHMS = _.chain(appGroupPlans)
        .map(m => moment(m.schedule).format('HH:mm:ss'))
        .uniq()
        .value();

      // 2. 按平台分组获取计划明细
      const targets = await getRepository(CrawlerTarget).find({
        where: {
          filePath: In(filePaths),
          active: true,
          official,
        },
      });

      // 3. 生成新计划并修改计划明细的file_path
      for (const chunkTargets of _.chunk(targets, 1000)) {
        const newFilePath = await this.crawlerProcessService.uploadTrackingNumberToS3(
          _.map(chunkTargets, target =>
            _.pick(target, ['trackingNumber', 'transporterAccountId', 'receiverPostalCode', 'shippingNumber']),
          ),
          transporter,
          moment().format('YYYY-MM-DD HH:mm:ss'),
          platform,
          official ? 'official' : 'unofficial',
        );

        const newPlans = schedulesHMS.map(HMS => {
          return CrawlerPlan.create({
            transporter,
            filePath: newFilePath,
            schedule: moment(HMS, 'HH:mm:ss').toDate(),
            status: 'READY',
            result: `0/0/${chunkTargets.length}`,
            automatic: false,
            comment: '合并计划',
            platform,
            official,
          });
        });
        await getRepository(CrawlerPlan).save(newPlans);

        const ids = chunkTargets.map(m => m.id);
        await getRepository(CrawlerTarget).update(
          {
            id: In(ids),
          },
          {
            filePath: newFilePath,
          },
        );
      }
    }

    // 5. 更新旧计划为DONE
    const planIds = plans.map(m => m.id);
    if (!_.isEmpty(planIds)) {
      await getRepository(CrawlerPlan).update(
        {
          id: In(planIds),
        },
        {
          status: 'DONE',
          endAt: new Date(),
          comment: '计划已被合并',
        },
      );
    }

    console.log(`${transporter}共${plans.length}个计划合并完成`);
    return 'SUCCESS';
  }
}
