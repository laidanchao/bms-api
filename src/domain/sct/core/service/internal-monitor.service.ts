import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { InternalMonitor } from '@/domain/sct/core/entity/internal-monitor.entity';
import moment from 'moment';
import { Between, getRepository, Not } from 'typeorm';
import { FileRecord, TrackingConstants } from '@/domain/sct/file/entity/file-record.entity';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import { CrawlerConfigService } from '@/domain/sct/crawler/service/crawler-config.service';
import XLSX from 'xlsx';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import _ from 'lodash';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { BusinessException } from '@/app/exception/business-exception';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';

@Injectable()
export class InternalMonitorService extends TypeOrmCrudService<InternalMonitor> {
  constructor(
    @InjectRepository(InternalMonitor) repo,
    private readonly crawlerConfigService: CrawlerConfigService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly trackingService: TrackingService,
    private readonly magicBiService: MagicBIService,
  ) {
    super(repo);
  }

  /**
   * 每日凌晨生成前一天内部轨迹异常数据
   * @param initDate
   */
  public async getInternalMonitorData(initDate) {
    const date = initDate || new Date();
    const formatDate = moment(date).format('YYYY-MM-DD');
    const { startTime, endTime } = this.getDateBetween(formatDate);
    const isExist = await this.repo.count({ where: { date: formatDate } });
    if (isExist) {
      throw new BusinessException(`${formatDate}数据已生成`);
    }
    const data = await this.genInternalMonitorData(startTime, endTime);
    data.forEach(f => {
      f.date = new Date(formatDate);
    });
    return await getRepository(InternalMonitor).save(data);
  }

  /**
   * 刷新内部轨迹异常数据
   * @param date
   * @param id
   */
  async refreshInternalMonitorData(date, id) {
    const { startTime, endTime } = this.getDateBetween(date);
    const historyInterMonitor = await this.repo.findOne({ id });
    const [data] = await this.genInternalMonitorData(startTime, endTime, historyInterMonitor.transporter);
    data.abnormalFileUrl = data.abnormalFileUrl
      ? historyInterMonitor.abnormalFileUrl + ',' + data.abnormalFileUrl
      : historyInterMonitor.abnormalFileUrl;
    return await getRepository(InternalMonitor).update({ id }, data);
  }

  /**
   * 轨迹补推
   */
  async trackingExtension(date) {
    const { startTime, endTime } = this.getDateBetween(date);
    const pushTrackingResult = await this.getPushTrackingResult(
      startTime,
      endTime,
      'trackingMonitor/getLostPushTracking',
    );

    let trackingNumbers = [];
    pushTrackingResult.map(m => {
      const lostTrackingNumbers = m.lostPushTracking.map(tracking => {
        const trackingObj = JSON.parse(tracking);
        return trackingObj?.trackingnumber;
      });
      trackingNumbers = trackingNumbers.concat(lostTrackingNumbers);
    });

    return await this.trackingService.batchAddTrackingPushLog(trackingNumbers);
  }

  /**
   * 更新当前日期的备注
   * @param date
   * @param note
   */
  async addNote(date, note) {
    const countMonitor = await this.repo.count({ date });
    if (!countMonitor) {
      throw new Error(`当前日期${date}监控数据还未生成`);
    }
    await this.repo.update({ date }, { note });
  }

  /**
   * 生成当日内部轨迹异常数据
   * @param startTime
   * @param endTime
   */
  async genInternalMonitorData(startTime, endTime, transporter?: string): Promise<InternalMonitor[]> {
    const transporters = await getRepository(Transporter).find({
      select: ['id'],
    });

    let transporterIds = transporters.map(m => m.id);
    if (transporter) {
      transporterIds = [transporter];
    }

    // 1. 获取包裹收集情况
    const collectParcelResult = await this.getCollectParcelResult(startTime, endTime, transporter);
    // 2. 获取轨迹推送情况
    const pushTrackingResult = await this.getPushTrackingResult(
      startTime,
      endTime,
      'trackingMonitor/getPushTrackingResult',
      transporter,
    );
    // 3. 获取FTP解析情况
    const ftpResult = await this.getFtpQuantity(startTime, endTime, transporter);
    // 4. 获取17track收集和注册情况
    const track17CollectResult = await this.get17trackCollectResult(startTime, endTime, transporter);
    // 5. 获取新增轨迹情况
    const newTrackingResult = await this.getNewTrackingResult(startTime, endTime, transporter);

    const promise = transporterIds.map(async transporterId => {
      const collectParcelRes = collectParcelResult.find(f => f.transporter === transporterId);
      const ftpRes = ftpResult.find(f => f.transporter === transporterId);
      const pushTrackingRes = pushTrackingResult.find(f => f.transporter === transporterId);
      const track17CollectRes = track17CollectResult.find(f => f.transporter === transporterId);
      const newTrackingRes = newTrackingResult.find(f => f.transporter === transporterId);

      let parcelIsAbnormal,
        ftpIsAbnormal,
        trackingPushIsAbnormal,
        track17IsAbnormal = false;
      if (collectParcelRes) {
        parcelIsAbnormal = collectParcelRes.expectedCollectParcelCount !== collectParcelRes.actualCollectParcelCount;
      }
      if (ftpRes) {
        ftpIsAbnormal = ftpRes.archivedFtp !== ftpRes.receivedFtp;
      }
      if (pushTrackingRes) {
        trackingPushIsAbnormal = pushTrackingRes.expectedPushTrackingCount !== pushTrackingRes.actualPushTrackingCount;
      }
      if (track17CollectRes) {
        track17IsAbnormal = track17CollectRes.expectedCollectCount !== track17CollectRes.actualCollectCount;
      }

      let abnormalFileUrl = '';
      const isAbnormal = parcelIsAbnormal || ftpIsAbnormal || trackingPushIsAbnormal || track17IsAbnormal;
      if (isAbnormal) {
        abnormalFileUrl = await this.uploadAbnormalData(
          transporterId,
          collectParcelRes?.lostCollectParcel || [],
          pushTrackingRes?.lostPushTracking || [],
          track17CollectRes?.unCollectedParcels || [],
          endTime,
        );
      }

      return InternalMonitor.create({
        transporter: transporterId,
        isAbnormal,
        expectedCollectQuantity: collectParcelRes?.expectedCollectParcelCount || 0,
        actualCollectQuantity: collectParcelRes?.actualCollectParcelCount || 0,
        archivedFtp: ftpRes?.archivedFtp || 0,
        receivedFtp: ftpRes?.receivedFtp || 0,
        expectedPushQuantity: pushTrackingRes?.expectedPushTrackingCount || 0,
        actualPushQuantity: pushTrackingRes?.actualPushTrackingCount || 0,
        expectedCollectQuantity17track: track17CollectRes?.expectedCollectCount || 0,
        collectedQuantity17track: track17CollectRes?.actualCollectCount || 0,
        registeredQuantity17track: track17CollectRes?.registeredCount || 0,
        gotTrackingQuantity: newTrackingRes?.addTrackingCount || 0,
        abnormalFileUrl,
      });
    });

    return await Promise.all(promise);
  }

  /**
   * expectedCollectParcelCount 统计按照爬虫配置表创建时间（utc)在前一天的应收集包裹数量
   * actualCollectParcelCount 统计实际收集的包裹数量target
   * lostCollectParcel 统计未收集的包裹
   * @param startTime
   * @param endTime
   */
  async getCollectParcelResult(
    startTime,
    endTime,
    transporter?: string,
  ): Promise<
    {
      transporter: string;
      expectedCollectParcelCount: number;
      actualCollectParcelCount: number;
      lostCollectParcel: any[];
    }[]
  > {
    const where: FindConditions<CrawlerConfig> = {
      enabled: true,
    };
    if (transporter) {
      where.transporter = transporter;
    }

    const crawlerConfigs = await this.crawlerConfigService.find({ where });
    if (_.isEmpty(crawlerConfigs)) {
      return [
        {
          transporter: '',
          expectedCollectParcelCount: 0,
          actualCollectParcelCount: 0,
          lostCollectParcel: [],
        },
      ];
    }
    const promises = crawlerConfigs.map(async crawlerConfig => {
      const where = {
        transporter: crawlerConfig.transporter,
        startTime,
        endTime,
        transporterAccountId: crawlerConfig.accounts,
        platform: crawlerConfig.platform,
        parcelType: crawlerConfig.parcelType,
      } as any;
      // 外部账号EXTERNAL_ACCOUNT更改需要更改magicBI
      if (crawlerConfig.accounts && crawlerConfig.accounts.length === 1 && crawlerConfig.accounts[0] === '*') {
        delete where.transporterAccountId;
      }
      if (crawlerConfig.platform && crawlerConfig.platform === '*') {
        delete where.platform;
      }
      const { data } = await this.magicBiService.getDataFromBI('trackingMonitor/getCollectParcelResult', where);
      return {
        transporter: crawlerConfig.transporter,
        expectedCollectParcelCount: data.expectedCollectParcelCount,
        actualCollectParcelCount: data.actualCollectParcelCount,
        lostCollectParcel: _.isEmpty(data.lostCollectParcel) ? [] : data.lostCollectParcel.split(';'),
      };
    });
    const result = await Promise.all(promises);
    return (
      _.chain(result)
        .groupBy('transporter')
        .map((items, key) => {
          return items.reduce(
            (accumulator, item) => {
              return {
                transporter: item.transporter,
                expectedCollectParcelCount: accumulator.expectedCollectParcelCount + item.expectedCollectParcelCount,
                actualCollectParcelCount: accumulator.actualCollectParcelCount + item.actualCollectParcelCount,
                lostCollectParcel: accumulator.lostCollectParcel.concat(item.lostCollectParcel),
              };
            },
            { expectedCollectParcelCount: 0, actualCollectParcelCount: 0, lostCollectParcel: [] },
          );
        })
        .flatten()
        .value() || []
    );
  }

  /**
   * expectedPushTrackingCount 统计按照推送配置应推送的轨迹数量
   * actualPushTrackingCount 统计实际推送的轨迹数量
   * lostPushTracking 应推未退的轨迹
   * 统计每日应推送给外部的轨迹数量
   */
  async getPushTrackingResult(
    startTime,
    endTime,
    BiPath,
    transporter?: string,
  ): Promise<
    { transporter: string; expectedPushTrackingCount: number; actualPushTrackingCount: number; lostPushTracking }[]
  > {
    let trackingPushConfigs = await getRepository(TrackingPush).find({ enabled: true });

    if (transporter) {
      trackingPushConfigs = trackingPushConfigs.filter(f => f.transporterIds.includes(transporter));
    }

    let array = [];
    for (const config of trackingPushConfigs) {
      const promises = config.transporterIds.map(async transporter => {
        const where = {
          startTime,
          endTime,
          platform: config.platform,
          transporterList: [transporter],
        } as any;

        if (config.clientId) {
          where.clientId = config.clientId;
        }
        if (!config.includeExternalAccount) {
          where.internal = true;
        }

        const { data } = await this.magicBiService.getDataFromBI(BiPath, where);
        return {
          transporter,
          expectedPushTrackingCount: data.expectedPushTrackingCount,
          actualPushTrackingCount: data.actualPushTrackingCount,
          lostPushTracking: _.isEmpty(data.lostPushTracking) ? [] : data.lostPushTracking.split(';'),
        };
      });

      const result = await Promise.all(promises);
      array = array.concat(result);
    }

    return (
      _.chain(array)
        .groupBy('transporter')
        .map((items, key) => {
          return items.reduce(
            (accumulator, item) => {
              return {
                transporter: item.transporter,
                expectedPushTrackingCount: accumulator.expectedPushTrackingCount + item.expectedPushTrackingCount,
                actualPushTrackingCount: accumulator.actualPushTrackingCount + item.actualPushTrackingCount,
                lostPushTracking: accumulator.lostPushTracking.concat(item.lostPushTracking),
              };
            },
            { expectedPushTrackingCount: 0, actualPushTrackingCount: 0, lostPushTracking: [] },
          );
        })
        .flatten()
        .value() || []
    );
  }

  /**
   * 获取ftp 文件数量
   */
  async getFtpQuantity(
    startTime,
    endTime,
    transporter?: string,
  ): Promise<{ transporter: string; archivedFtp: number; receivedFtp: number }[]> {
    const where: FindConditions<FileRecord> = {
      createdAt: Between(startTime, endTime),
    };
    if (transporter) {
      where.transporter = transporter;
    }
    const fileRecords = await getRepository(FileRecord).find({ where });
    const endStatus = [
      TrackingConstants.PARSED_EVENT.toString(),
      TrackingConstants.ARCHIVED_EVENT.toString(),
      TrackingConstants.IGNORED_EVENT.toString(),
    ];
    return (
      _.chain(fileRecords)
        .groupBy('transporter')
        .map((items, key) => {
          return {
            transporter: key,
            archivedFtp: items.filter(f => endStatus.includes(f.event))?.length || 0,
            receivedFtp: items.length || 0,
          };
        })
        .value() || []
    );
  }

  /**
   * 生成轨迹异常数据excel
   */
  async uploadAbnormalData(transporter, uncollectedTrackingArray, unPushTrackingArray, unCollected17Parcels, date) {
    const JsonUncollectedTrackingArray = uncollectedTrackingArray.map(it => {
      return JSON.parse(it);
    });
    const JsonUnPushTrackingArray = unPushTrackingArray.map(it => {
      return JSON.parse(it);
    });

    const book = XLSX.utils.book_new();
    const sheet1 = XLSX.utils.json_to_sheet(JsonUncollectedTrackingArray, { cellStyles: true });
    const sheet2 = XLSX.utils.json_to_sheet(JsonUnPushTrackingArray, { skipHeader: false, cellStyles: true });
    const sheet3 = XLSX.utils.json_to_sheet(unCollected17Parcels, { skipHeader: false, cellStyles: true });
    XLSX.utils.book_append_sheet(book, sheet1, '未收集包裹');
    XLSX.utils.book_append_sheet(book, sheet2, '未推送轨迹');
    XLSX.utils.book_append_sheet(book, sheet3, '未收集的17track包裹');
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
    const filePath = `tracking/daily_internal_monitor/轨迹异常-${transporter}-${moment(date).format(
      'YYYYMMDD',
    )}-${moment().format('HHmmss')}.xlsx`;
    await this.awsService.uploadFile(buffer, filePath, this.configService.get('Bucket').cms);
    return filePath;
  }

  getDateBetween(date) {
    const startTime = moment(date)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment(date)
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    return {
      startTime,
      endTime,
    };
  }

  private async get17trackCollectResult(
    startTime: any,
    endTime: any,
    transporter?: string,
  ): Promise<
    {
      transporter: string;
      expectedCollectCount: number;
      actualCollectCount: number;
      registeredCount: number;
      unCollectedParcels: any[];
    }[]
  > {
    let trackingConfigs = await getRepository(Track17).find({ enabled: true });
    if (transporter) {
      trackingConfigs = trackingConfigs.filter(f => f.transporterId === transporter);
    }

    const array = [];
    for (const { platform, transporterAccounts, transporterId } of trackingConfigs) {
      // 拼接sql
      let sqlWhere = `parcel.platform = '${platform}' and parcel.transporter = '${transporterId}'`;
      if (!_.isEmpty(transporterAccounts)) {
        const accounts = transporterAccounts.map(m => `'${m}'`).toString();
        sqlWhere += ` and parcel.transporterAccountId in (${accounts})`;
      } else {
        sqlWhere += ` and parcel.transporterAccountId != 'EXTERNAL_ACCOUNT'`;
      }

      const parcels = await getRepository(Parcel)
        .createQueryBuilder('parcel')
        .leftJoin(Track17Request, 'record', 'parcel.trackingNumber = record.trackingNumber')
        .andWhere('parcel.createdAt between :startTime and :endTime ', { startTime, endTime })
        .andWhere(sqlWhere)
        .select('parcel.trackingNumber', 'trackingNumber')
        .addSelect('record.id', 'recordId')
        .addSelect('record.registerStatus', 'registerStatus')
        .addSelect('parcel.createdAt', 'createdAt')
        .addSelect('parcel.transporterAccountId', 'transporterAccountId')
        .getRawMany();

      const actualCollectedParcels = parcels.filter(f => f.recordId);
      const registeredParcels = parcels.filter(f => f.registerStatus === 'SUCCESS');
      const unCollectedParcels = parcels.filter(f => !f.recordId);

      array.push({
        transporter: transporterId,
        expectedCollectCount: parcels.length,
        actualCollectCount: actualCollectedParcels.length,
        registeredCount: registeredParcels.length,
        unCollectedParcels: _.isEmpty(unCollectedParcels)
          ? []
          : unCollectedParcels.map(m => {
              return {
                trackingNumber: m.trackingNumber,
                createdAt: m.createdAt,
                transporterAccountId: m.transporterAccountId,
              };
            }),
      });
    }

    return (
      _.chain(array)
        .groupBy('transporter')
        .map((items, key) => {
          return items.reduce(
            (accumulator, item) => {
              return {
                transporter: item.transporter,
                expectedCollectCount: accumulator.expectedCollectCount + item.expectedCollectCount,
                actualCollectCount: accumulator.actualCollectCount + item.actualCollectCount,
                registeredCount: accumulator.registeredCount + item.registeredCount,
                unCollectedParcels: accumulator.unCollectedParcels.concat(item.unCollectedParcels),
              };
            },
            { expectedCollectCount: 0, actualCollectCount: 0, registeredCount: 0, unCollectedParcels: [] },
          );
        })
        .flatten()
        .value() || []
    );
  }

  private async getNewTrackingResult(
    startTime: any,
    endTime: any,
    transporter?: string,
  ): Promise<{ transporter: string; addTrackingCount: number }[]> {
    const andWhere = transporter ? `tracking.transporter = '${transporter}'` : '1=1';

    const trackings = await getRepository(Tracking)
      .createQueryBuilder('tracking')
      .where('tracking.createdAt between :startTime and :endTime ', { startTime, endTime })
      .andWhere(andWhere)
      .groupBy('tracking.transporter')
      .select('tracking.transporter', 'transporter')
      .addSelect('count(1)', 'quantity')
      .getRawMany();

    return trackings.map(m => {
      return {
        transporter: m.transporter,
        addTrackingCount: m.quantity,
      };
    });
  }
}
