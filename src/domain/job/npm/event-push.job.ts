import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { FtpJob } from '@/domain/job/base/ftp.job';
import { getRepository, In, LessThanOrEqual } from 'typeorm';
import { EventPushRequest, EventPushStatus } from '@/domain/npm/event-push/entity/event-push-request.entity';
import moment from 'moment';
import _ from 'lodash';
import papa from 'papaparse';
import { AwsService } from '@/domain/external/aws/aws.service';
import { EventPushLog } from '@/domain/npm/event-push/entity/event-push-log.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { EventPushTask, EventPushTaskStatus } from '@/domain/npm/event-push/entity/event-push-task.entity';

@Injectable()
export class EventPushJob extends FtpJob {
  constructor(
    xPushService: XPushService,
    @Inject(ConfigService) configService: ConfigService,
    private awsService: AwsService,
  ) {
    super(xPushService, configService);
  }

  /**
   * 通过FTP推送物流节点给法邮
   */
  async handle(option?): Promise<any> {
    console.log('开始推送物流节点');
    // 获取需要推送的节点数据，未推送且节点时间小于当前时间
    const eventPushData = await getRepository(EventPushRequest).find({
      where: {
        status: EventPushStatus.TO_BE_PUSHED,
        eventTime: LessThanOrEqual(moment.utc().toDate()),
      },
    });
    console.log('需要推送' + eventPushData.length || 0 + '条');

    // 每个文件上限8000条数据
    const chunkEventPushData = _.chunk(eventPushData, 8000);
    const allTaskIds = eventPushData.map(m => m.taskId);
    const failedTaskIds = [];
    for (let i = 0; i < chunkEventPushData.length; i++) {
      const chunkData = chunkEventPushData[i];
      const ids = chunkData.map(m => m.id);
      const taskIds = chunkData.map(m => m.taskId);

      try {
        // 生成需要的文件数据
        const trackingFileData = this.buildEventPushData(chunkData);

        // 上传S3
        const { fileName, filePath } = await this.uploadS3(trackingFileData, i);

        // 上传到ftp
        const buffer = Buffer.from(trackingFileData);
        console.log('文件开始上传...');
        await this.ftpClient.put(buffer, `${this.config.ftp.source}/${fileName}`);
        console.log('文件上传结束...');
        //保存推送日志，更新推送状态
        await getRepository(EventPushLog).save({
          filePath,
          trackingPushIds: ids,
        });
        await getRepository(EventPushRequest).update(
          { id: In(ids) },
          {
            status: EventPushStatus.PUSHED,
          },
        );
        console.log('推送成功！');
      } catch (e) {
        await getRepository(EventPushRequest).update(
          { id: In(ids) },
          {
            status: EventPushStatus.FAILED,
            failedReason: `推送失败:${e.message}`,
          },
        );
        failedTaskIds.concat(taskIds);
        console.log(`法邮物流节点推送失败!i:${i},${e.message}`);
        const content =
          `**<font color="#117CEE">给派送商推送event失败</font>**\n\n ` +
          `*  事件码：COM_CLI\n` +
          `*  派送商：COLISSIMO\n` +
          `*  错误明细：i:${i},${e.message}\n`;
        this.xPushService.sendDingDing(content, 'tracking');
      }
    }

    if (!_.isEmpty(failedTaskIds)) {
      await getRepository(EventPushTask).update(
        {
          id: In(failedTaskIds),
        },
        {
          status: EventPushTaskStatus.FAILED,
        },
      );
    }

    const successTaskIds = _.difference(allTaskIds, failedTaskIds);
    if (!_.isEmpty(successTaskIds)) {
      await getRepository(EventPushTask).update(
        {
          id: In(successTaskIds),
        },
        {
          status: EventPushTaskStatus.PUSHED,
          pushedAt: new Date(),
        },
      );
    }
  }

  /**
   * 生成需要的文件数据
   * @param pushData
   * @private
   */
  private buildEventPushData(pushData: EventPushRequest[]) {
    const dataArray = pushData.map(data => ({
      HHH001: 'DDD001',
      parcelreference: data.trackingNumber,
      eventproducerid: 'FTL',
      eventcode: data.eventCode.split('_')[0],
      eventreason1: data.eventCode.split('_')[1],
      eventreason2: '',
      eventreason3: '',
      eventdatetime: data.eventTime,
      eventdepotcode: 'S06607',
      eventcomment: '',
      urlproofofdelivery: '',
      recipientname: '',
      transportunitid: '',
      chosendeliverydate: '',
      vehicleregistrationnumber: '',
      vehicleenergytype: '',
      attachmentdepotcode: '',
      operatorname: '',
      applicationname: '',
      redirectiondepotcode: '',
      TransportUnitIdType: '',
      TransportUnitType: '',
    }));

    return papa.unparse(dataArray, { header: true, delimiter: ';' });
  }

  /**
   * 文件上传S3
   * @param data
   * @param i
   * @private
   */
  private async uploadS3(data, i: number) {
    const dtNow = moment.utc();
    const index = _.padStart(i + 1, 3, 0);
    const fileName = `FTL.EVT.${dtNow.format('YYYYMMDD')}.${dtNow.format('HHmmss')}_${index}.ok`;
    const filePath = `tracking/tracking_push/colissimo/${fileName}`;

    await this.awsService.uploadFile(data, filePath, this.configService.get('Bucket').cms);

    return {
      fileName,
      filePath,
    };
  }
}
