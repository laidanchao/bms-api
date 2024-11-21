import { Injectable } from '@nestjs/common';
import moment from 'moment/moment';
import _ from 'lodash';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { CrawlerPlanService } from '@/domain/sct/crawler/service/crawler-plan.service';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';
import { AccountService } from '@/domain/cam/account/account.service';
import { TrackingBrokerAdapter } from '@/domain/sct/core/adapter/tracking-broker-adapter';
import { TrackingInsertService } from '@/domain/sct/core/service/tracking-insert.service';
import { getRepository, In, MoreThan } from 'typeorm';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { CrawlerTargetManual, TARGET_MANUAL_STATUS } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { SiteType } from '@/domain/sct/core/dto/crawler-target-manual.dto';

/**
 * 执行主动抓取轨迹的任务 一次执行一条任务
 * 与 {@link CrawlerPlanManagerJob} 配合使用
 *
 * @author keminfeng
 */
@Injectable()
export class CrawlerService {
  constructor(
    private readonly crawlerPlanService: CrawlerPlanService,
    private readonly crawlerTargetService: CrawlerTargetService,
    private readonly trackingInsertService: TrackingInsertService,
    private readonly xPushService: XPushService,
    private readonly accountService: AccountService,
    private readonly trackingBrokerAdapter: TrackingBrokerAdapter,
    private readonly trackingHandlerNewService: TrackingHandlerNewService,
  ) {}

  async execute(option?): Promise<any> {
    // 从 tracking plan 表中找出需要执行的一条任务 并且检查当前运行的包裹数量
    const trackingPlan = await this.crawlerPlanService.takeCrawlerPlan(
      this.constructor.name,
      option.transporter,
      option.official,
    );
    if (!trackingPlan) {
      return;
    }
    const startDateTime = moment().toDate();

    const targetArray = await this.crawlerTargetService.find({
      where: {
        filePath: trackingPlan.filePath,
      },
      select: [
        'trackingNumber',
        'transporterAccountId',
        'trackAimStatus',
        'receiverPostalCode',
        'active',
        'shippingNumber',
      ],
    });
    const activeTargetArray = targetArray.filter(f => f.active);

    // 派送商所有的账号信息map
    const transporterAccountMap = await this.accountService.findAccountByTransporterMap(trackingPlan.transporter);

    const chunkTrackingArray = [];
    const trackingArray: Tracking[] = [];
    try {
      // activeTargetAccountGroup 根据账号分组，抓轨迹需要给对应的账号信息
      _.chain(activeTargetArray)
        .groupBy('transporterAccountId')
        .mapKeys((value, key) => {
          chunkTrackingArray.push({
            trackingNumberPostCodeArray: _.map(value, m => ({
              trackingNumber: m.trackingNumber,
              postCode: m.receiverPostalCode,
              shippingNumber: m.shippingNumber,
            })),
            account: key,
          });
        })
        .value();

      const promises = _.map(chunkTrackingArray, async it => {
        const tracking = await this.trackingBrokerAdapter.fetchTracking(
          trackingPlan.transporter,
          it.trackingNumberPostCodeArray,
          it.account,
          transporterAccountMap[it.account]?.accountInfo || {},
          trackingPlan.official,
        );
        trackingArray.push(...tracking);
      });
      await Promise.all(promises);
      trackingArray.forEach(tracking => {
        tracking.transporter = trackingPlan.transporter;
      });

      await this.crawlerTargetService.increaseCount(_.map(activeTargetArray, 'trackingNumber'));
    } catch (e) {
      //TODO client获取轨迹出现异常 应该抛出异常 还是应该直接返回空数组？ 获取到了大部分 一个包裹抛出异常 就前功尽弃 如何处理？
      this.logout(e.message, 'error');
      this.logout(e.stack, 'error');
    }

    let insertedTrackingNumberCount = 0;
    const activeTrackingNumberCount = activeTargetArray.length;
    const totalTrackingNumberCount = targetArray.length;
    if (!_.isEmpty(trackingArray)) {
      try {
        const insertedTrackingArray = await this.saveTrackingArray(trackingArray);
        const insertedTrackingNumber = _.uniq(insertedTrackingArray.map(tracking => tracking.trackingNumber));
        if (insertedTrackingNumber.length) {
          await this.trackingHandlerNewService.handleTracking(insertedTrackingNumber);
        }

        insertedTrackingNumberCount = insertedTrackingNumber.length;
      } catch (e) {
        const content =
          `**<font color="#F38F39">爬虫计划-轨迹保存失败</font>**\n\n ` +
          `*  派送商： ${trackingPlan.transporter}\n` +
          `*  状态： 轨迹插入失败，请检查原因${e.message}\n` +
          `*  文件路径： ${trackingPlan.filePath}\n`;
        this.xPushService.sendDingDing(content, 'tracking').then();
      }
    }

    await this.crawlerPlanService.createNextCrawlerPlan(trackingPlan);
    this.logout(
      `${trackingPlan.filePath}: ${insertedTrackingNumberCount} 个包裹新增轨迹 / ${activeTrackingNumberCount} 个活跃包裹 / 共 ${totalTrackingNumberCount} 个包裹`,
    );
    const elapsedTime = moment().diff(startDateTime);

    // 更新 target plan 表状态 (本次任务有新增轨迹的包裹数量/本次任务中处于活跃状态的包裹数量/本次任务文件中总包裹数量)
    await this.crawlerPlanService.update(
      { id: trackingPlan.id },
      {
        status: 'DONE',
        result: `${insertedTrackingNumberCount}/${activeTrackingNumberCount}/${totalTrackingNumberCount}`,
        elapsedTime,
        endAt: new Date(),
      },
    );
  }

  private logout(message, logLevel = 'log') {
    console[logLevel](`${this.constructor.name}: ${message}`);
  }

  private async saveTrackingArray(trackingArray: Tracking[]) {
    // 添加待推送轨迹记录
    const insertedIds = await this.trackingInsertService.bulkInsert(trackingArray);
    return await getRepository(Tracking).findByIds(insertedIds);
  }

  /**
   * 添加到待爬取列表
   * @param trackingNumbers
   * @param sort
   */
  async addToCrawlList(trackingNumbers: string[], sort = 100) {
    const halfYearAgo = moment()
      .subtract(6, 'months')
      .format('YYYY-MM-DD');
    const crawlerConfigs = await getRepository(CrawlerConfig).find({
      enabled: true,
    });

    const errorTrackingNumber = [];
    for (const chunkTrackingNumbers of _.chunk(trackingNumbers, 500)) {
      const parcels = await getRepository(Parcel).find({
        where: {
          trackingNumber: In(chunkTrackingNumbers),
          createdAt: MoreThan(halfYearAgo),
        },
      });

      const targets = [];
      for (const parcel of parcels) {
        const transporterCrawlerConfigs = crawlerConfigs.filter(f => f.transporter === parcel.transporter);
        const siteType = this.getSiteType(transporterCrawlerConfigs, parcel.platform, parcel.transporterAccountId);
        if (!siteType) {
          errorTrackingNumber.push(parcel.trackingNumber);
          continue;
        }

        targets.push(
          CrawlerTargetManual.create({
            trackingNumber: parcel.trackingNumber,
            shippingNumber: parcel.shippingNumber,
            transporter: parcel.transporter,
            transporterSite: this.getSiteType(transporterCrawlerConfigs, parcel.platform, parcel.transporterAccountId),
            transporterAccountId: parcel.transporterAccountId,
            filePath: '',
            status: TARGET_MANUAL_STATUS.READY,
            receiverPostalCode: parcel.receiverPostalCode,
            sort,
          }),
        );
      }

      await getRepository(CrawlerTargetManual).save(targets);
    }

    if (_.isEmpty(errorTrackingNumber)) {
      return '全部成功添加到待爬列表';
    } else {
      const successCount = trackingNumbers.length - errorTrackingNumber.length;
      return `成功：${successCount}条，失败：${errorTrackingNumber.length}条，包裹：${errorTrackingNumber.toString()}`;
    }
  }

  private getSiteType(crawlerConfigs: CrawlerConfig[], platform: string, transporterAccountId: string) {
    const config = crawlerConfigs.find(
      f =>
        (f.platform === f.platform || f.platform === '*') &&
        (f.accounts.includes(transporterAccountId) || f.accounts.includes('*')),
    );

    if (config) {
      return config.official ? SiteType.OFFICIAL_SITE : SiteType.UNOFFICIAL_SITE;
    } else {
      return null;
    }
  }

  async crawlTracking(option) {
    const transporter = option.transporter;
    const limit = option?.limit || 100;
    const transporterSite = option?.siteType || SiteType.UNOFFICIAL_SITE;
    const targets = await getRepository(CrawlerTargetManual).find({
      where: {
        status: TARGET_MANUAL_STATUS.READY,
        transporterSite,
        transporter,
      },
      take: limit,
      order: {
        sort: 'ASC',
      },
    });

    if (_.isEmpty(targets)) {
      return;
    }

    const targetIds = targets.map(m => m.id);

    await getRepository(CrawlerTargetManual).update(
      {
        id: In(targetIds),
      },
      {
        status: TARGET_MANUAL_STATUS.RUNNING,
      },
    );

    const trackingArray = [];
    const transporterAccountId = targets[0].transporterAccountId;
    const transporterAccountMap = await this.accountService.findAccountByTransporterMap(transporter);
    for (const chunkTargets of _.chunk(targets, 10)) {
      const chunkTargetIds = chunkTargets.map(m => m.id);
      try {
        const trackings = await this.trackingBrokerAdapter.fetchTracking(
          transporter,
          chunkTargets.map(target => {
            return {
              trackingNumber: target.trackingNumber,
              postCode: target.receiverPostalCode,
              shippingNumber: target.shippingNumber,
            };
          }),
          null,
          transporterAccountMap[transporterAccountId]?.accountInfo || {},
          transporterSite === SiteType.OFFICIAL_SITE,
        );
        trackingArray.push(...trackings);

        await getRepository(CrawlerTargetManual).update(
          {
            id: In(chunkTargetIds),
          },
          {
            status: TARGET_MANUAL_STATUS.SUCCESS,
            failReason: moment().format(),
          },
        );
      } catch (e) {
        await getRepository(CrawlerTargetManual).update(
          {
            id: In(chunkTargetIds),
          },
          {
            status: TARGET_MANUAL_STATUS.FAILED,
            failReason: e.message,
          },
        );
        console.log(e.message);
      }
    }

    if (!_.isEmpty(trackingArray)) {
      try {
        const insertedTrackingArray = await this.saveTrackingArray(trackingArray);
        const insertedTrackingNumber = _.uniq(insertedTrackingArray.map(tracking => tracking.trackingNumber));
        if (!_.isEmpty(insertedTrackingNumber)) {
          await this.trackingHandlerNewService.handleTracking(insertedTrackingNumber);
        }
      } catch (e) {
        console.error(e);
        const content =
          `**<font color="#F38F39">crawlTracking-轨迹保存失败</font>**\n\n ` +
          `*  状态： 轨迹插入失败，原因${e.message}\n`;
        this.xPushService.sendDingDing(content, 'tracking').then();
      }
    }
  }

  async getTrackingNumbers(limit?) {
    limit = limit || 1000;
    const targets = await getRepository(CrawlerTargetManual).find({
      where: {
        status: TARGET_MANUAL_STATUS.READY,
        transporterSite: SiteType.UNOFFICIAL_SITE,
      },
      take: limit,
      order: {
        sort: 'ASC',
      },
    });

    const targetIds = targets.map(m => m.id);

    await getRepository(CrawlerTargetManual).update(
      {
        id: In(targetIds),
      },
      {
        status: TARGET_MANUAL_STATUS.RUNNING,
      },
    );

    return targets.map(m => m.trackingNumber);
  }

  async saveTracking(body: any) {
    const trackingArray = _.flatMapDeep(
      body
        .filter(result => result.returnCode.toString() === '200' && result.shipment.event)
        .map(result => {
          return result.shipment.event.map(rawTracking => {
            return {
              description: rawTracking.label,
              event: rawTracking.code || '',
              timestamp: moment(rawTracking.date)
                .startOf('minute')
                .toDate(),
              trackingNumber: result.shipment.idShip,
            };
          });
        }),
    );

    if (!_.isEmpty(trackingArray)) {
      try {
        const insertedTrackingArray = await this.saveTrackingArray(trackingArray);
        const insertedTrackingNumber = _.uniq(insertedTrackingArray.map(tracking => tracking.trackingNumber));
        if (insertedTrackingNumber.length) {
          await this.trackingHandlerNewService.handleTracking(insertedTrackingNumber);
        }
      } catch (e) {
        this.xPushService.sendDingDing('保存轨迹出错：' + e.message, 'tracking').then();
      }
    }

    const trackingNumbers = trackingArray.map(m => m.trackingNumber);
    await getRepository(CrawlerTargetManual).update(
      {
        trackingNumber: In(trackingNumbers),
        status: TARGET_MANUAL_STATUS.RUNNING,
      },
      {
        status: TARGET_MANUAL_STATUS.SUCCESS,
      },
    );
  }
}
