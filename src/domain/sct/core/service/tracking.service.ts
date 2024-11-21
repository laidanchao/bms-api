import { Injectable, OnModuleInit } from '@nestjs/common';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import _ from 'lodash';
import { TrackingBrokerAdapter } from '@/domain/sct/core/adapter/tracking-broker-adapter';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { getRepository, In, MoreThan } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { TrackingPushLog, TrackingPushStatus } from '@/domain/npm/tracking-push/entities/tracking-push-log.entity';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import { DriverFactory } from '../../webhook/drivers/driver-factory';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { CrawlerTargetService } from '../../crawler/service/crawler-target.service';
import { MileStone } from '@/domain/sct/webhook/dto/track17.dto';
import moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { DDRobotCrypto } from '@/domain/external/dingRobot/DDRobotCrypto';
import { AccountService } from '@/domain/cam/account/account.service';
import { BusinessException } from '@/app/exception/business-exception';
import { EventService } from '@/domain/sct/core/service/event.service';
import { WebhookSettingService } from '@/domain/sct/webhook/service/webhook-setting.service';
import { TrackingInsertService } from '@/domain/sct/core/service/tracking-insert.service';
import { Track17EventService } from '@/domain/sct/core/service/track17-event.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { ParcelStatus } from '@/domain/utils/Enums';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { KafkaProducer } from '@/domain/external/kafka/kafka.producer';
import TrackingWebhookLog from '@/domain/sct/webhook/entity/trackingWebhookLog.entity';

@Injectable()
export class TrackingService extends TypeOrmCrudService<Tracking> {
  constructor(
    @InjectRepository(TrackingRepository) private trackingRepository: TrackingRepository,
    private readonly trackingBrokerAdapter: TrackingBrokerAdapter,
    private readonly trackingHandlerService: TrackingHandlerService,
    private readonly webhookSettingService: WebhookSettingService,
    private xPushService: XPushService,
    private parcelPushRequestService: ParcelPushRequestService,
    private crawlerTargetService: CrawlerTargetService,
    private configService: ConfigService,
    private accountService: AccountService,
    private eventService: EventService,
    private trackingInsertService: TrackingInsertService,
    private track17EventService: Track17EventService,
    private trackingHandlerNewService: TrackingHandlerNewService,
  ) {
    super(trackingRepository);
  }

  async create(entity) {
    // TrackingEvent处理
    const trackingEvent = await this.trackingHandlerService.handleTrackingEventList(
      [entity],
      entity?.transporter || '',
    );
    entity.description = entity?.description || trackingEvent[0]?.fr;

    await this.bulkInsert([entity]);
    await this.trackingHandlerNewService.handleTracking([entity.trackingNumber]);
    return 'success';
  }

  /**
   * 将 tracking 数组根据时间去重 优先取 轨迹文件中的
   * @param trackingArray
   * @param dataSource
   */
  filterTrackingByDataSources(trackingArray: Tracking[], dataSource?: string) {
    switch (dataSource) {
      case 'TRACKING_FILE': {
        return trackingArray.filter(tracking => tracking.fromFile);
      }
      case 'WEB_SITE': {
        return trackingArray.filter(tracking => !tracking.fromFile);
      }
      default: {
        const trackingSet = _.groupBy(
          trackingArray.filter(tracking => tracking.fromFile),
          'timestamp',
        );
        trackingArray.forEach(tracking => {
          if (!trackingSet[tracking.timestamp]) {
            trackingSet[tracking.timestamp] = [tracking];
          }
        });
        return Array.from(_.flatMapDeep(trackingSet));
      }
    }
  }

  /**
   * 想个办法弄到scheduler服务去
   * @param transporter
   * @param trackingNumberArray
   */
  async validAndFetchLatestTracking(
    transporter: string,
    trackingNumberArray: string[],
    official: boolean,
    subMonth = 6,
  ) {
    const trackingNumberArrayUniq = _.uniq(trackingNumberArray);
    const halfYearBefore = moment()
      .subtract(subMonth, 'month')
      .format('YYYY-MM-DD');

    for (const chunkTrackingNumber of _.chunk(trackingNumberArrayUniq, 1000)) {
      const parcels = await getRepository(Parcel).find({
        where: {
          trackingNumber: In(chunkTrackingNumber),
          transporter,
          createdAt: MoreThan(halfYearBefore),
        },
        select: ['trackingNumber', 'transporterAccountId', 'receiverPostalCode', 'shippingNumber'],
      });
      if (parcels.length !== chunkTrackingNumber.length) {
        const notExistTrackingNumber = _.difference(
          chunkTrackingNumber,
          parcels.map(it => it.trackingNumber),
        );
        throw new BusinessException(`Fail to crawl,parcel (${notExistTrackingNumber.join(',')}) not found in CMS`);
      }
      await this.fetchTrackingAndInsert(transporter, parcels, official);
    }
  }

  async fetchTrackingAndInsert(
    transporter,
    trackingNumberArray: { transporterAccountId; trackingNumber; receiverPostalCode; shippingNumber }[],
    official: boolean,
  ) {
    const transporterAccountMap = await this.accountService.findAccountByTransporterMap(transporter);
    const trackingArray = [];
    const chunkTrackingArray = [];
    _.chain(trackingNumberArray)
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
        transporter,
        it.trackingNumberPostCodeArray,
        it.account,
        transporterAccountMap[it.account]?.accountInfo || {},
        official,
      );
      trackingArray.push(...tracking);
    });
    await Promise.all(promises);
    if (!trackingArray || !trackingArray.length) {
      return;
    }
    trackingArray.forEach(tracking => {
      tracking.transporter = transporter;
    });
    await this.bulkInsert(trackingArray);
    await this.trackingHandlerNewService.handleTracking(_.map(trackingNumberArray, 'trackingNumber'));
  }

  async fetchLatestTrackingByOSC(transporter: string, trackingNumberArray: string[], account: string) {
    const oscConfig = this.configService.get('OSC');
    const transporterAccount = await getRepository(Account).findOne({ account });
    const timestamp = new Date().getTime();
    const signature = new DDRobotCrypto(oscConfig.apiKey, timestamp).getSignature();
    const accountInfo = {
      apiKey: oscConfig.apiKey,
      account,
      username: transporterAccount.accountInfo.contractNumber,
      password: transporterAccount.accountInfo.password,
      timestamp,
      signature,
    };
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 1000)) {
      const trackingArray = await this.trackingBrokerAdapter.fetchTrackingByOSC(
        transporter,
        chunkTrackingNumberArray,
        accountInfo,
      );
      if (!trackingArray || !trackingArray.length) {
        return;
      }
      trackingArray.forEach(tracking => {
        tracking.transporter = transporter;
      });
      await this.bulkInsert(trackingArray);
      await this.trackingHandlerNewService.handleTracking(chunkTrackingNumberArray);
    }
  }

  async findByIds(ids, options?) {
    return await this.trackingRepository.findByIds(ids, options);
  }

  /**
   * 批量添加待推送轨迹
   * @param trackingNumbers
   */
  async batchAddTrackingPushLog(trackingNumbers: string[]) {
    for (const chunk of _.chunk(trackingNumbers, 500)) {
      const trackings = await this.trackingRepository.find({
        where: { trackingNumber: In(chunk) },
      });
      const parcels = await getRepository(Parcel).find({
        where: {
          trackingNumber: In(chunk),
        },
      });

      const logs = [];
      for (const tracking of trackings) {
        const parcel = parcels.find(f => f.trackingNumber === tracking.trackingNumber);
        if (parcel) {
          const log = TrackingPushLog.create({
            transporterId: parcel.transporter,
            platform: parcel.platform,
            clientId: parcel.clientId,
            status: TrackingPushStatus.READY,
            trackingNumber: tracking.trackingNumber,
            event: tracking.event,
            timestamp: tracking.timestamp,
            description: tracking.description,
            location: tracking.location,
            fromFile: tracking.fromFile,
            fileName: tracking.fileName,
            trackingId: tracking.id,
            reference: tracking.reference,
            getFileTime: tracking.getFileTime,
            transporterDelayTime: tracking.transporterDelayTime,
          });
          logs.push(log);
        }
      }

      const result = await getRepository(TrackingPushLog)
        .createQueryBuilder()
        .insert()
        .into('npm_tracking_push_log')
        .values(logs)
        .orIgnore()
        .execute();
      console.log('插入条数：', result.identifiers.filter(result => !!result).length);
    }
    console.log('添加完成');
  }

  async bulkInsert(trackingArray) {
    return this.trackingInsertService.bulkInsert(trackingArray);
  }

  async webhookTrackSendToKafka(body: any, header: any) {
    await new KafkaProducer(this.xPushService).sendKafka('CAINIAO_WEBHOOK_TRACKING', {
      body,
      header,
    });
  }

  /**
   * webhook轨迹解析并保存
   * @param body
   * @param header
   * @param platform
   */
  async webhookTracking(body: any, header: any, platform: WEBHOOK_SOURCE) {
    let trackingData: any = {};
    let webhookRecordSave: any = {};
    try {
      const driver = DriverFactory.getDriver(platform);
      const platformAccountList = await this.accountService.findAccountInfoRedis(platform);
      const { data, record } = await driver.build(body, header, platformAccountList);
      webhookRecordSave = record;
      trackingData = data;
      webhookRecordSave.transporterAccount = trackingData.account;
      // 有收到轨迹
      if (!_.isEmpty(trackingData.trackingArray)) {
        // 只保留轨迹节点的时间在一个月内的轨迹
        const oneMonthAgo = moment().subtract(1, 'months');
        trackingData.trackingArray = trackingData.trackingArray.filter(f => moment(f.timestamp).isAfter(oneMonthAgo));
        // 根据webhook配置判断是否需要插入tracking表
        switch (platform) {
          case WEBHOOK_SOURCE['17TRACK']:
            webhookRecordSave.isActive = true;
            await this.bulkInsert(trackingData.trackingArray);
            await this.webhookTrackingUpdateParcel(
              trackingData.parcel,
              body.data.track_info,
              trackingData.trackingArray,
            );
            break;
          default:
            const isSaveTracking = await this.matchWebhookSetting(
              platform,
              trackingData.account,
              trackingData.platform,
            );
            webhookRecordSave.isActive = isSaveTracking;
            if (isSaveTracking) {
              await this.bulkInsert(trackingData.trackingArray);
              // 调用kafka，更新包裹并推送包裹信息
              await new KafkaProducer(this.xPushService).sendKafka('handle-tracking-new', {
                trackingNumbers: [trackingData.trackingNumber],
              });
            }
            break;
        }
      }
      await this.saveWebhookLog(webhookRecordSave);
    } catch (e) {
      if (e.message.includes('包裹不存在')) {
        throw e;
      }
      if (e.message.includes('{"trackingNumber":')) {
        e = JSON.parse(e.message);
      }
      if (
        platform !== WEBHOOK_SOURCE['17TRACK'] ||
        e.message !== 'null value in column "event" of relation "sct_webhook_tracking" violates not-null constraint'
      ) {
        const content =
          `**<font color="#ECAA04">webhook轨迹插入异常</font>**\n\n ` +
          `*  platform： ${platform}\n` +
          `*  单号： ${e?.trackingNumber || trackingData.trackingNumber}\n` +
          `*  账号： ${e?.account}\n` +
          `*  错误原因：${e.message}`;
        this.xPushService.sendDingDing(content, 'tracking').then();
      }
      webhookRecordSave = e?.record;
      await this.saveWebhookLog(webhookRecordSave);
    }
  }

  /**
   * 保存webhook推送日志
   */
  async saveWebhookLog(record): Promise<void> {
    const trackingLog = new TrackingWebhookLog();
    trackingLog.trackingNumber = record.trackingNumber;
    trackingLog.requestBody = typeof record.body === 'string' ? record.body : JSON.stringify(record.body);
    trackingLog.requestHeader = typeof record.headers === 'string' ? record.headers : JSON.stringify(record.headers);
    trackingLog.webhookSource = record.webhookSource;
    trackingLog.transporterAccount = record.transporterAccount;
    trackingLog.isActive = record.isActive;
    await getRepository(TrackingWebhookLog).save(trackingLog);
  }
  async matchWebhookSetting(platform: string, account: string, parcelPlatform: string) {
    const webhookSetting = await this.webhookSettingService.findSettingRedis(platform);
    const isSaveTracking = webhookSetting.some(
      s =>
        s.transporter === platform &&
        (s.platform === parcelPlatform || s.platform === '*') &&
        (_.includes(s.account, account) || _.includes(s.account, '*')),
    );
    return isSaveTracking;
  }

  async webhookTrackingUpdateParcel(parcel: Parcel, track_info, trackingArray) {
    // 更新包裹信息
    const newParcel = await this.updateParcel(parcel, track_info, trackingArray);

    // 包裹有更新
    if (newParcel) {
      // 添加待推送包裹
      await this.parcelPushRequestService.bulkInsert([newParcel]);

      // 更新爬虫明细
      await this.crawlerTargetService.updateCrawlerTarget([newParcel]);

      // 记录包裹时效
      if (newParcel.isArrived) {
        await new KafkaProducer(this.xPushService).sendKafka('parcel-aging', { parcels: [newParcel] });
      }
    }
  }

  /**
   * 轨迹的event和description处理
   * @param trackings
   * @param transporter
   */
  async handleTrackingEvent(trackings, transporter: string, trackingEvents) {
    // 添加缺失的event记录
    await this.addMissingEvents(trackings, transporter, trackingEvents);

    // 当event未指定包裹状态时发出通知，并替换tracking的description
    trackings.forEach(f => {
      const trackingEvent =
        trackingEvents.find(it => it.event === f.event && it.transporter === transporter) ||
        trackingEvents.find(it => it.event === f.event && !it.transporter);

      // 法邮、colicoli、cp优先取法语描述
      if (['COLISSIMO', 'COLICOLI', 'COLISPRIVE', 'MONDIAL_RELAY', 'CAINIAO', 'DISPEO'].includes(transporter)) {
        f.description = trackingEvent?.fr || f.description;
      } else {
        f.description = trackingEvent?.zh || f.description;
      }
    });

    return trackings;
  }

  /**
   * 添加缺失的event记录
   * @param trackings
   * @param transporter
   * @private
   */
  private async addMissingEvents(trackings, transporter, trackingEvents) {
    const events = trackingEvents.map(m => m.event);
    const missingEventTracking = trackings.filter(it => !events.includes(it.event));

    // 如果有不存在的event,则新增。当有未保存的轨迹事件时，发出通知
    if (!_.isEmpty(missingEventTracking)) {
      for (const tracking of missingEventTracking) {
        const message = `出现一条未保存的轨迹事件${tracking.event}:${tracking.description}。单号${tracking.trackingNumber},供应商${transporter}`;
        this.xPushService.sendDingDing(message, 'tracking').then();
      }
      await this.eventService.saveUnresolvedTrackingEvents(trackings, transporter);
    }
  }

  /**
   * 更新包裹信息
   * @param parcel
   * @param trackInfo
   * @private
   */
  private async updateParcel(parcel: Parcel, trackInfo: any, trackingArray) {
    const { milestone, latest_event, latest_status } = trackInfo;
    const originParcel = _.cloneDeep(parcel);

    const { transferredAt, arrivedAt, returnedAt, status } = await this.getDateAndStatus(
      milestone,
      latest_event,
      latest_status,
      parcel.transporter,
      trackingArray,
      parcel.createdAt,
    );

    parcel.lastDescription = latest_event.description;
    parcel.lastTimestamps = new Date(latest_event.time_utc);
    parcel.lastEvent = latest_event.stage || '';

    parcel.transferredAt = this.getEarlierTime(parcel.transferredAt, transferredAt);
    parcel.arrivedAt = this.getEarlierTime(parcel.arrivedAt, arrivedAt);
    parcel.returnedAt = this.getEarlierTime(parcel.returnedAt, returnedAt);
    parcel.isArrived = !!arrivedAt;
    parcel.isReturned = !!returnedAt;
    parcel.status = status || parcel.status;
    parcel.isLost = ParcelStatus.LOST === status;
    parcel.isFinished = [ParcelStatus.ARRIVED, ParcelStatus.RETURNED, ParcelStatus.STOPPED, ParcelStatus.LOST].includes(
      parcel.status as ParcelStatus,
    );

    if (parcel.isArrived) {
      parcel.aging = _.round(
        moment.duration(new Date(parcel.arrivedAt).getTime() - new Date(parcel.transferredAt).getTime(), 'ms').asDays(),
        1,
      );
    }

    if (!_.isEqual(originParcel, parcel)) {
      await getRepository(Parcel).update(parcel.id, {
        lastDescription: parcel.lastDescription,
        lastTimestamps: parcel.lastTimestamps,
        transferredAt: parcel.transferredAt,
        arrivedAt: parcel.arrivedAt,
        returnedAt: parcel.returnedAt,
        isArrived: parcel.isArrived,
        isReturned: parcel.isReturned,
        status: parcel.status,
        aging: parcel.aging,
        isFinished: parcel.isFinished,
        isLost: parcel.isLost,
      });

      return parcel;
    } else {
      return null;
    }
  }

  /**
   * 获取各个节点的时间和最新包裹状态
   * @param milestone
   * @param latest_event
   * @param latest_status
   * @param transporter
   * @param trackingArray
   * @private
   */
  private async getDateAndStatus(milestone, latest_event, latest_status, transporter, trackingArray, createdAt) {
    let transferredAt = null;
    let arrivedAt = null;
    let returnedAt = null;
    let status = null;

    const trackingEvent = await this.eventService.findTrackingEventByTransporterWithLock(latest_status.sub_status, '');
    if (trackingEvent && trackingEvent.parcelStatus) {
      status = trackingEvent.parcelStatus;
    }

    // 最新状态属于上网时
    if (['DELIVERING', 'AVAILABLE_FOR_PICKUP', 'ARRIVED', 'ABNORMAL', 'RETURNED', 'LOST', 'STOPPED'].includes(status)) {
      const track17Events = await this.track17EventService.getEvents();
      const ignoredList = track17Events.filter(f => f.transporter === transporter && f.type === 'IGNORED');
      const transitList = track17Events.filter(f => f.transporter === transporter && f.type === 'IN_TRANSIT');

      // 描述不在黑名单的才能更新上网时间
      if (!ignoredList.some(s => s.description === latest_event?.description)) {
        const minTracking = _.chain(trackingArray)
          .filter(f => transitList.some(s => f.description.includes(s.description)))
          .sortBy('timestamp')
          .head()
          .value();
        // 当存在一条上网轨迹时（上网时间最小的）
        if (minTracking) {
          transferredAt = minTracking.timestamp;
        } else if (moment(latest_event?.time_utc).isAfter(createdAt)) {
          // 上网时间需要大于创建时间
          transferredAt = latest_event?.time_utc;
        }
      }

      // 17最新状态不是LOST，但是轨迹描述属于LOST，则会标记状态为LOST
      if (status !== 'LOST') {
        const lostDescriptionList = track17Events
          .filter(f => f.transporter === transporter && f.type === 'LOST')
          .map(m => m.description);
        const descriptionList = trackingArray.map(m => m.description);
        if (!_.isEmpty(_.intersection(lostDescriptionList, descriptionList))) {
          status = 'LOST';
        }
      }
    }

    for (const { key_stage, time_utc } of milestone) {
      if (!time_utc) {
        continue;
      }

      const timestamp = time_utc ? new Date(time_utc) : time_utc;

      if ([MileStone.Delivered].includes(key_stage)) {
        arrivedAt = this.getEarlierTime(arrivedAt, timestamp);
      }

      if ([MileStone.Returned, MileStone.Returning].includes(key_stage)) {
        returnedAt = this.getEarlierTime(returnedAt, timestamp);
      }
    }

    return {
      transferredAt,
      arrivedAt,
      returnedAt,
      status,
    };
  }

  private getEarlierTime(dt1, dt2) {
    let earlierTime = null;
    switch (true) {
      case !dt1 && !dt2:
        earlierTime = null;
        break;
      case !dt2:
        earlierTime = dt1;
        break;
      case !dt1:
        earlierTime = dt2;
        break;
      case moment(dt1).isSameOrBefore(dt2):
        earlierTime = dt1;
        break;
      case moment(dt2).isBefore(dt1):
        earlierTime = dt2;
        break;
      default:
        break;
    }
    return earlierTime;
  }
}
