import { EntityManager, In, Transaction, TransactionManager } from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { classToPlain } from 'class-transformer';
import { NormalJob } from '@/domain/job/base/normal.job';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { ParcelPushLogService } from '@/domain/npm/parcel-push/service/parcel-push-log.service';
import { ParcelPushService } from '@/domain/npm/parcel-push/service/parcel-push.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { ParcelPush, PushType } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { MessageType } from '@ftlab/xpush-client';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 推送包裹信息给各个平台
 */
@Injectable()
export class ParcelPushJob extends NormalJob {
  constructor(
    @Inject(ParcelPushRequestService) private readonly parcelPushRequestService: ParcelPushRequestService,
    @Inject(ParcelPushLogService) private readonly parcelPushLogService: ParcelPushLogService,
    @Inject(ParcelPushService) private readonly parcelPushService: ParcelPushService,
    @Inject(ParcelExtendService) private readonly parcelService: ParcelExtendService,
    private myKafkaService: MyKafkaService,
    private xPushService: XPushService,
  ) {
    super();
  }

  async execute() {
    // 1.find
    const parcelPushRequests = await this.parcelPushRequestService.find({
      take: 50000,
      order: {
        id: 'ASC',
      },
    });
    if (_.isEmpty(parcelPushRequests)) {
      Logger.log(`parcelPushRequests records empty`);
      return;
    }
    const parcelPushConfigs = await this.parcelPushService.find({
      where: {
        enabled: true,
      },
    });
    const platformParcelPushRequest = _.groupBy(parcelPushRequests, 'platform');

    const promises = _.map(platformParcelPushRequest, async (pushRequests, platform) => {
      const config = _.find(parcelPushConfigs, config => config.platform === platform);
      if (config) {
        // 过滤出需要删除的数据（包裹状态是created或者包裹的派送商不在推送配置中的）
        const [needDeleteArray, resultArray] = _.partition(
          pushRequests,
          pushRequest =>
            pushRequest.status === 'CREATED' ||
            (!config.transporters.includes('*') && !config.transporters.includes(pushRequest.transporter)),
        );
        await this.removeCreatedStatusParcelPushRequest(needDeleteArray);
        const pushRequestChunk = _.chunk(resultArray, 1000);
        let i = 0;
        const messageUUIDs = [];
        for (const pushRequest of pushRequestChunk) {
          // 2.构建
          const uuId = uuidv4();
          // Logger.log(`BuildAndPushMessageToXPJob: executing 第${i + 1}/${syncLogsChunk.length} syncLogs, uuId=${uuId}`);
          const message = {
            webhookId: config.id,
            content: pushRequest,
            sent: true,
            uuId,
          };
          // 3.发送成功/失败
          await this.pushMessage([message], config.topic);
          // 4.成功删除By Id, 插入ParcelPushLog
          await this.movePushRequestToLog(pushRequest, message);
          // Logger.log(
          //   `BuildAndPushMessageToXPJob: 第${i + 1}/${syncLogsChunk.length} syncLogs, uuId=${uuId} execute success!`,
          // );
          i = i + 1;
          messageUUIDs.push(uuId);
        }
      } else {
        console.log(`${platform} is not need push! parcelCount = ${pushRequests.length}`);
        const ids = _.map(pushRequests, 'id');
        await this.parcelPushRequestService.delete({ id: In(ids) });
      }
    });
    try {
      await Promise.all(promises);
    } catch (e) {
      // 5.发消息提示
      this.xPushService.sendDingDing(`${e.message}`, 'default');
    }
  }

  @Transaction()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async movePushRequestToLog(parcelPushRequests, message, @TransactionManager() manager?: EntityManager) {
    if (!_.isEmpty(parcelPushRequests)) {
      message.content = '';
      const parcelPushLogs = _.map(parcelPushRequests, parcelPushRequest => {
        const plainObject = _.omit(classToPlain(parcelPushRequest), ['id', 'createdAt', 'updatedAt']);
        plainObject.uuId = message.uuId;
        plainObject.syncStatus = 'SUCCESS';
        parcelPushRequest.uuId = message.uuId;
        parcelPushRequest.syncStatus = 'SUCCESS';
        return plainObject;
      });
      const ids = _.map(parcelPushRequests, 'id');
      message.content = ids;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.parcelPushLogService.bulkInsert(parcelPushLogs);
      await this.parcelPushRequestService.delete({ id: In(ids) });
      // step3: 更新所有的parcel的sync字段
      const trackingNumbers = _.map(parcelPushRequests, 'trackingNumber');
      await this.parcelService.update({ trackingNumber: In(trackingNumbers) }, { sync: true });
      // await this.parcelPushRequestRepository.bulkUpdate(syncLogs, {
      //   tableName: 'parcelSyncLog',
      //   whereColumns: ['trackingNumber'],
      //   updateColumns: ['syncStatus', 'uuId'],
      // });
    }
  }

  async removeCreatedStatusParcelPushRequest(parcelPushRequest): Promise<void> {
    if (!_.isEmpty(parcelPushRequest)) {
      const ids = _.map(parcelPushRequest, 'id');
      await this.parcelPushRequestService.delete({ id: In(ids) });
    }
  }

  /**
   * 推送消息
   * @param messages
   * @param topic
   * @private
   */
  private async pushMessage(messages: any[], topic: string) {
    const contents = _.chain(messages)
      .map('content')
      .flatten()
      .value();

    return this.myKafkaService.kafkaEnqueue(topic, { body: contents });
  }
}
