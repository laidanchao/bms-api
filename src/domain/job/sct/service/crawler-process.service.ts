import moment from 'moment';
import papa from 'papaparse';
import { Between, In, LessThan, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { CrawlerPlanService } from '@/domain/sct/crawler/service/crawler-plan.service';
import { CrawlerConfigService } from '@/domain/sct/crawler/service/crawler-config.service';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';
import _ from 'lodash';
import { XPushService } from '@/domain/external/xpush/x-push.service';
const logger = new Logger('crawler-process-service');

@Injectable()
export class CrawlerProcessService {
  constructor(
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly xPushService: XPushService,
    private readonly crawlerConfigService: CrawlerConfigService,
    private readonly crawlerTargetService: CrawlerTargetService,
    private readonly crawlerPlanService: CrawlerPlanService,
    private readonly parcelService: ParcelExtendService,
  ) {}

  /**
   * 收集昨日或者指定日期的包裹信息
   * @param startTime
   * @param endTime
   */
  public async collectTrackingNumbersByDate(startTime, endTime, notCollected = false): Promise<void> {
    try {
      const crawlerConfigs = await this.crawlerConfigService.find({
        where: {
          enabled: true,
        },
      });
      if (crawlerConfigs && crawlerConfigs.length === 0) {
        logger.log('爬虫计划均未启用！');
        return;
      }
      for (const crawlerConfig of crawlerConfigs) {
        const where = {
          transporter: crawlerConfig.transporter,
          createdAt: Between(startTime, endTime),
          transporterAccountId: In(crawlerConfig.accounts),
          platform: crawlerConfig.platform,
        } as any;
        // 配置中['*']表示不包含外部账号的所有内部账号
        if (crawlerConfig.accounts && crawlerConfig.accounts.length === 1 && crawlerConfig.accounts[0] === '*') {
          where.transporterAccountId = Not('EXTERNAL_ACCOUNT');
        }
        if (crawlerConfig.platform && crawlerConfig.platform === '*') {
          delete where.platform;
        }

        let parcelQuantityByPlatform;
        if (notCollected) {
          parcelQuantityByPlatform = await this.parcelService.countByPlatformNotCollected(where);
        } else {
          parcelQuantityByPlatform = await this.parcelService.countByPlatform(where);
        }

        for (const platformQuantity of parcelQuantityByPlatform) {
          const { quantity, platform } = platformQuantity;
          logger.log(`Yesterday[${startTime} - ${endTime}] ${crawlerConfig.transporter} created ${quantity} parcel(s)`);

          let offset = 0;
          const limit = 1000;
          // if offset >= yesterdayParcelQuantity, 'select' will got empty set
          while (offset < quantity) {
            // 分页找出供应商昨天的包裹
            where.platform = platform;
            let parcelArray;
            if (notCollected) {
              parcelArray = await this.parcelService.fetchTrackingNumbersNotCollected(where, limit);
            } else {
              parcelArray = await this.parcelService.fetchTrackingNumbers(where, limit, offset);
            }
            // 增加是否官方提供的字段
            parcelArray.forEach(f => {
              f.official = crawlerConfig.official;
            });
            // todo 待修改 需要封装
            // 上传csv文件
            const path = await this.uploadTrackingNumberToS3(
              parcelArray,
              crawlerConfig.transporter,
              startTime,
              platform,
              crawlerConfig.official ? 'official' : 'unofficial',
            ); // 取当前时间endTime之后的爬虫时间,如果已经超过当天爬虫时间，生成第二天所有的爬虫计划
            let crawlerExecuteDate = moment().format('YYYY-MM-DD');
            let executeMultiplePoints = crawlerConfig.multiplePoints.filter(time => time > moment().format('HH:mm:ss'));
            if (!executeMultiplePoints.length) {
              executeMultiplePoints = crawlerConfig.multiplePoints;
              crawlerExecuteDate = moment()
                .add(1, 'days')
                .format('YYYY-MM-DD');
            }
            // 存到 crawler_plan  表
            const flag = await this.crawlerPlanService.insertIntoCrawlerPlan(
              executeMultiplePoints,
              crawlerConfig.transporter,
              platform,
              path,
              `0/0/${parcelArray.length}`,
              crawlerConfig.official,
              crawlerExecuteDate,
            );
            // 取出 filePath 存到 crawler_target 表
            if (flag) {
              await this.insertIntoCrawlerTarget(crawlerConfig, path, parcelArray);
            }
            offset += limit;
          }
        }
      }
      this.xPushService.sendDingDing(`${startTime} - ${endTime} 包裹收集，结束执行收集任务`, 'tracking').then();
    } catch (e) {
      this.xPushService.sendDingDing(e.message, 'tracking').then();
    }
  }

  /**
   * 校验昨天是否已经收集前天的包裹信息生成plan
   */
  async checkBeforeYesterdayPlan(): Promise<void> {
    const startTime = moment()
      .subtract(1, 'day')
      .startOf('day')
      .toDate();
    const endTime = moment()
      .subtract(1, 'day')
      .endOf('day')
      .toDate();
    const crawlerConfigs = await this.crawlerConfigService.find({
      where: {
        enabled: true,
      },
    });
    const [transporters, accounts] = crawlerConfigs.reduce(
      (result, crawlerConfig) => {
        result[0].push(crawlerConfig.transporter);
        result[1].concat(crawlerConfig.accounts);
        return result;
      },
      [[], []],
    );
    const where = {
      transporter: In(transporters),
      createdAt: Between(startTime, endTime),
      transporterAccountId: In(accounts),
    } as any;
    const frontTrackingNumbers = await this.parcelService.fetchTrackingNumberByWhere(where, 100, 0, 'ASC');
    const rearTrackingNumbers = await this.parcelService.fetchTrackingNumberByWhere(where, 100, 0, 'DESC');
    const trackingNumbers = [...frontTrackingNumbers, ...rearTrackingNumbers];
    const crawlerTargetWhere = {
      trackingNumber: In(trackingNumbers),
    };
    const crawlerTargetCount = await this.crawlerTargetService.count(crawlerTargetWhere);
    if (crawlerTargetCount !== trackingNumbers.length) {
      await this.collectTrackingNumbersByDate(startTime, endTime);
      this.xPushService
        .sendDingDing(
          `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDay()} 包裹未收集，执行收集任务`,
          'tracking',
        )
        .then();
    }
  }

  async uploadTrackingNumberToS3(
    trackingNumberObjectArray,
    transporterId,
    date,
    platform,
    officialStr,
  ): Promise<string> {
    const csv = papa.unparse(trackingNumberObjectArray);
    const time = date
      .split(' ')
      .shift()
      .replace(/-/g, '/');
    const path = `tracking/daily_tracking_number/${time}/${transporterId}/${platform}-${officialStr}-${moment()
      .utc()
      .format('x')}.csv`;
    await this.awsService.uploadFile(csv, path, this.configService.get('Bucket').cms);
    return path;
  }

  /**
   * 插入爬取包裹
   * @param crawlerConfig
   * @param filePath
   * @param parcelArray
   * @private
   */
  private async insertIntoCrawlerTarget(crawlerConfig: CrawlerConfig, filePath, parcelArray): Promise<void> {
    const crawlerTargetArray: Array<CrawlerTarget> = parcelArray.map(parcel => {
      return {
        transporter: crawlerConfig.transporter,
        filePath,
        trackingNumber: parcel.trackingNumber,
        transporterAccountId: parcel.transporterAccountId,
        trackAimStatus: crawlerConfig.trackAimStatus,
        maxCount: crawlerConfig.maxTimes,
        receiverPostalCode: parcel.receiverPostalCode,
        official: crawlerConfig.official,
        shippingNumber: parcel.shippingNumber,
      };
    });
    await this.crawlerTargetService.bulkInsert(crawlerTargetArray);
  }

  /**
   * 更新爬取包裹的状态
   * @public
   */
  public async setCrawlerTargetInactive(): Promise<void> {
    await this.crawlerTargetService.updateActive();
  }

  /**
   * 重置执行超时的任务 设置状态为 READY
   * @public
   */
  public async resetTimeoutPlanJobStatus(): Promise<void> {
    const needUpPlan = await this.crawlerPlanService.find({
      status: 'RUNNING',
      updatedAt: LessThan(
        moment()
          .utc()
          .add(-1.5, 'hours'),
      ),
    });
    if (needUpPlan.length > 0) {
      await this.crawlerPlanService.update({ id: In(_.map(needUpPlan, 'id')) }, { status: 'READY' });
      const content =
        `**CrawlerPlan [${needUpPlan.length}]个超时任务被重置为 READY**\n\n ` +
        needUpPlan
          .map(plan => {
            return `*  ${plan.id}-${plan.filePath} `;
          })
          .join('\n ');
      this.xPushService.sendDingDing(content, 'tracking').then();
    }
  }
}
