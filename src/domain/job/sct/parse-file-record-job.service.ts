import _ from 'lodash';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { ParserUtils } from '@/domain/scb/bill/parse/parser.utils';
import * as ColissimoTrackingPolicy from '@/domain/job/sct/policy/colissimo-tracking-policy';
import * as DispeoTrackingPolicy from '@/domain/job/sct/policy/dispeo-tracking-policy';
import { getRepository, In } from 'typeorm';
import moment from 'moment/moment';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { FileRecord, TrackingConstants } from '@/domain/sct/file/entity/file-record.entity';
import { FileRecordService } from '@/domain/sct/file/service/file-record.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { ColispriveTrackingPolicy } from '@/domain/job/sct/policy/colisprive-tracking-policy';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { TrackingHandleListener } from './service/tracking-handle.listener';
import { FtpSetting } from '@/domain/sct/file/entity/ftp-setting.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { EventService } from '@/domain/sct/core/service/event.service';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { MRTrackingPolicy } from '@/domain/job/sct/policy/mr-tracking-policy';

/**
 * 解析轨迹文件
 */
@Injectable()
export class ParseFileRecordJob extends NormalJob {
  constructor(
    private fileRecordService: FileRecordService,
    private awsService: AwsService,
    private readonly trackingService: TrackingService,
    private readonly parcelService: ParcelExtendService,
    @Inject(ConfigService) private configService: ConfigService,
    private trackingHandlerNewService: TrackingHandlerNewService,
    private myKafkaService: MyKafkaService,
    private eventService: EventService,
  ) {
    super();
  }

  protected async handle(option?): Promise<any> {
    const fileRecords = await this.fileRecordService.findByEvent(TrackingConstants.EXTRACTED_EVENT, option.limit || 1);

    const allAccounts = await getRepository(Account).find();

    const ftpEnabledConfigs = await getRepository(FtpSetting).find({ enabled: true });

    // parse COLISSIMO & COLISPRIVE tracking file
    const cmsBucket = this.configService.get('Bucket').cms;
    for (const fileRecord of fileRecords) {
      // 是法邮且未开启ftp解析配置，则移动到不解析的目录下
      if (fileRecord.transporter === 'COLISSIMO') {
        const { platform } = allAccounts.find(f => f.account === fileRecord.transporterAccountId);
        if (
          !_.some(
            ftpEnabledConfigs,
            s =>
              s.transporter === fileRecord.transporter &&
              (s.platform === platform || s.platform === '*') &&
              (s.account.includes(fileRecord.transporterAccountId) || s.account.includes('*')),
          )
        ) {
          // 移动s3目录
          const targetPath = fileRecord.fileUrl.replace(fileRecord.name, `ignore/${fileRecord.name}`);
          await this.awsService.moveObjects({
            sourcePath: fileRecord.fileUrl,
            targetPath,
            targetBucket: cmsBucket,
          });
          // 更新fileRecord保存的目录和状态
          await getRepository(FileRecord).update(
            { id: fileRecord.id },
            {
              fileUrl: targetPath,
              event: TrackingConstants.IGNORED_EVENT,
            },
          );

          continue;
        }
      }

      const start = new Date();
      // download rawTrackingArray
      const buffer = await this.awsService.download(fileRecord.fileUrl, cmsBucket);
      const dataGridService = new ParserUtils();
      let options = { header: false, delimiter: ';', skipEmptyLines: true, typing: false };
      if (fileRecord.transporter === 'DISPEO') {
        options = { header: true, delimiter: '|', skipEmptyLines: true, typing: false };
      }
      const rawTrackingArray = dataGridService.parse(buffer, options);

      // 获取该平台的或者没有指定平台的所有event
      const trackingEvents = await this.eventService.findByTransporter(fileRecord.transporter);
      //parse rawTrackingArray
      for (const chunkTrackingArray of _.chunk(rawTrackingArray, 1000)) {
        if (fileRecord.transporter === 'COLISSIMO') {
          await this.cmHandleTracks(chunkTrackingArray, fileRecord, trackingEvents);
        } else if (fileRecord.transporter === 'COLISPRIVE') {
          await this.cpHandleTracks(chunkTrackingArray, fileRecord.name, fileRecord.lastModifyAt, trackingEvents);
        } else if (fileRecord.transporter === 'MONDIAL_RELAY') {
          await this.mrHandleTracks(chunkTrackingArray, fileRecord, trackingEvents);
        } else if (fileRecord.transporter === 'DISPEO') {
          await this.dispeoHandleTracks(chunkTrackingArray, fileRecord, trackingEvents);
        }
      }

      await this.fileRecordService.updateByEvent(
        fileRecord.id,
        fileRecord.transporter,
        {
          event: TrackingConstants.PARSED_EVENT,
          parsedAt: moment().toDate(),
        },
        start,
      );
    }
  }

  async saveTrackings(trackings) {
    const result = await this.trackingService.bulkInsert(trackings);
    Logger.log(`trackings count: ${trackings.length}`);
    return result;
  }

  /**
   * Save tracking and update parcel and shipment timestamps
   * 解析法邮轨迹文件时 轨迹描述不再为中文时 同时修改{@link TrackingListener.pushTrackingToKafka}
   * TODO 移除此处更新包裹信息代码 交给{@link TrackingHandleListener.trackingHandleConsumer}处理更合适 包括存储法邮重量信息
   *
   * @param {Array} rawTrackingList
   * @param cmTrackingFile
   * @returns {Promise<Object>}
   * @private
   */
  private async cmHandleTracks(rawTrackingList, cmTrackingFile, trackingEvents): Promise<void> {
    let trackings = ColissimoTrackingPolicy.parse(rawTrackingList, cmTrackingFile.name, cmTrackingFile.lastModifyAt);
    // 处理tracking event 和 desc
    trackings = await this.trackingService.handleTrackingEvent(trackings, 'COLISSIMO', trackingEvents);

    const insertedIdArray = await this.saveTrackings(trackings);
    const trackingArray = await getRepository(Tracking).findByIds(insertedIdArray);
    const trackingNumbers: string[] = _.chain(trackingArray)
      .map('trackingNumber')
      .uniq()
      .value();

    await this.trackingHandlerNewService.handleTracking(trackingNumbers);
  }

  private async cpHandleTracks(rawTrackings, fileName, lastModifyAt, trackingEvents) {
    const events = await getRepository(Event).find({
      transporter: 'COLISPRIVE',
    });

    const trackings = ColispriveTrackingPolicy.parse(rawTrackings, events);
    //获取解析后的所有trackingNumbers
    const trackingNumbers = _.chain(trackings)
      .map('trackingNumber')
      .uniq()
      .value();

    //colisprive解析后的trackingNumber实际上是parcel的shippingNumber,找到对应的parcels
    const parcels = await this.parcelService.find({
      where: { shippingNumber: In(trackingNumbers) },
    });

    //更新跟踪的trackingNumber
    trackings.map(tracking => {
      tracking.fileName = `${fileName}`;
      tracking.fromFile = true;
      tracking.transporter = 'COLISPRIVE';
      tracking.getFileTime = lastModifyAt;
      const parcel = parcels.find(parcel => parcel.shippingNumber === tracking.trackingNumber);
      if (parcel) {
        tracking.trackingNumber = parcel.trackingNumber;
        return tracking;
      } else {
        // throw new BusinessException(`${tracking.trackingNumber} 不存在`);
      }
    });

    // 新增tracking event
    await this.trackingService.handleTrackingEvent(trackings, 'COLISPRIVE', trackingEvents);

    const insertedIdArray = await this._saveTrackings(trackings);
    const trackingArray = await getRepository(Tracking).findByIds(insertedIdArray);
    const trackingNumbersNew: string[] = _.chain(trackingArray)
      .map('trackingNumber')
      .uniq()
      .value();
    await this.myKafkaService.kafkaEnqueue('handle-tracking-new', { trackingNumbers: trackingNumbersNew });
  }

  private async mrHandleTracks(rawTrackings, mrTrackingFile, trackingEvents) {
    let trackings = MRTrackingPolicy.parse(rawTrackings, mrTrackingFile.name, mrTrackingFile.lastModifyAt);
    trackings = await this.trackingService.handleTrackingEvent(trackings, 'MONDIAL_RELAY', trackingEvents);

    const insertedIdArray = await this._saveTrackings(trackings);
    const trackingArray = await getRepository(Tracking).findByIds(insertedIdArray);
    const trackingNumbers: string[] = _.chain(trackingArray)
      .map('trackingNumber')
      .uniq()
      .value();

    await this.trackingHandlerNewService.handleTracking(trackingNumbers);
  }

  private async dispeoHandleTracks(rawTrackingList, dispeoTrackingFile, trackingEvents): Promise<void> {
    let trackings = DispeoTrackingPolicy.parse(
      rawTrackingList,
      dispeoTrackingFile.name,
      dispeoTrackingFile.lastModifyAt,
    );
    // 处理tracking event 和 desc
    trackings = await this.trackingService.handleTrackingEvent(trackings, 'DISPEO', trackingEvents);

    const insertedIdArray = await this.saveTrackings(trackings);
    const trackingArray = await getRepository(Tracking).findByIds(insertedIdArray);
    const trackingNumbers: string[] = _.chain(trackingArray)
      .map('trackingNumber')
      .uniq()
      .value();

    await this.trackingHandlerNewService.handleTracking(trackingNumbers);
  }

  private async _saveTrackings(trackings: Tracking[]) {
    const results = await this.trackingService.bulkInsert(trackings);
    Logger.log(`trackings count: ${trackings.length}`);
    return results;
  }
}
