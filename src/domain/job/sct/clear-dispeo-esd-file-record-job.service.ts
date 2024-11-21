import { Inject, Injectable } from '@nestjs/common';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { FtpJob } from '@/domain/job/base/ftp.job';
import _ from 'lodash';
import moment from 'moment/moment';
import { FileRecordService } from '@/domain/sct/file/service/file-record.service';
import { TrackingConstants } from '@/domain/sct/file/entity/file-record.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 将Dispeo-esd已归档的轨迹文件从ftp删除
 */
@Injectable()
export class ClearDISPEOEsdFileRecordJob extends FtpJob {
  constructor(
    private fileRecordService: FileRecordService,
    private awsService: AwsService,
    @Inject(ConfigService) configService: ConfigService,
    xPushService: XPushService,
  ) {
    super(xPushService, configService);
  }

  async handle(option?): Promise<any> {
    const fileRecords = await this.fileRecordService.find({
      where: {
        event: TrackingConstants.PARSED_EVENT,
        transporter: 'DISPEO',
      },
      take: option.limit || 120,
    });

    if (!_.isEmpty(fileRecords)) {
      const path = `${this.config.ftp.source}`;
      const files = await this.ftpClient.list(path);

      for (const chunk of _.chunk(fileRecords, 3)) {
        const promises = chunk.map(async fileRecord => {
          try {
            const start = moment().toDate();
            // 3.根据fileUrl, 判断是否存在S3
            // 4.核对文件名与大小, 如果大小不一致, 则发送提醒消息, 结束. 反之下一步
            const judge = await this.awsService.exists(fileRecord.fileUrl, this.configService.get('Bucket').cms);
            if (judge) {
              const foundCount = _.filter(files, file => file.name === fileRecord.name).length;
              if (foundCount) {
                if (foundCount === 1) {
                  // 直接从sftp服务器上删除该文件
                  await this.ftpClient.delete(path + '/' + fileRecord.name);
                  // 更新FileRecords事件值
                  await this.fileRecordService.updateByEvent(
                    fileRecord.id,
                    fileRecord.transporter,
                    {
                      event: TrackingConstants.ARCHIVED_EVENT,
                      deletedAt: moment().toDate(),
                    },
                    start,
                  );
                } else {
                  this.xPushService.sendDingDing(`SFTP有${foundCount}份重名文件:${fileRecord.name}, please check!`);
                }
              } else {
                // 更新DispeoTrackingFile事件值
                await this.fileRecordService.updateByEvent(
                  fileRecord.id,
                  fileRecord.transporter,
                  {
                    event: TrackingConstants.ARCHIVED_EVENT,
                    deletedAt: moment().toDate(),
                  },
                  start,
                );
              }
            } else {
              this.xPushService.sendDingDing(`FileRecords表存在无效的数据. 文件名为: ${fileRecord.name} please check!`);
            }
          } catch (e) {
            console.log(e);
            this.xPushService.sendDingDing(`ClearDISPEOEsdFileRecordJob got error, 异常信息: ${e}`);
          }
        });
        await Promise.all(promises);
      }
    }
  }
}
