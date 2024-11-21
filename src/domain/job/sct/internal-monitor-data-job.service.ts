import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { InternalMonitorService } from '@/domain/sct/core/service/internal-monitor.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import moment from 'moment';
import { dataConvertToImage } from '@/domain/utils/util';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import _ from 'lodash';

/**
 * 生成轨迹监控数据 一天一行数据
 */
@Injectable()
export class InternalMonitorDataJob extends NormalJob {
  constructor(
    private readonly internalMonitorService: InternalMonitorService,
    private configService: ConfigService,
    private awsService: AwsService,
    private readonly xPushService: XPushService,
  ) {
    super();
  }

  protected async handle(option?): Promise<any> {
    const date = option?.date || new Date();
    const dateFormat = moment(date)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    try {
      let dayData = await this.internalMonitorService.getInternalMonitorData(dateFormat);

      dayData.forEach(f => {
        f.gotTrackingQuantity = Number(f.gotTrackingQuantity);
      });
      dayData = _.orderBy(dayData, ['isAbnormal', 'gotTrackingQuantity'], ['desc', 'desc']);

      const columnNames = [
        'Transporter',
        'IsAbnormal',
        'ParcelCollect',
        'FTP',
        '17Track',
        'NewTracking',
        'TrackingPush',
      ];

      const data = dayData.map(m => {
        return {
          transporter: m.transporter || '',
          isAbnormal: m.isAbnormal ? 'abnormal' : 'normal',
          collectParcel: `${m.actualCollectQuantity}/${m.expectedCollectQuantity}` || '',
          ftp: `${m.archivedFtp}/${m.receivedFtp}` || '',
          track17:
            `${m.registeredQuantity17track}/${m.collectedQuantity17track}/${m.expectedCollectQuantity17track}` || '',
          newTracking: `${m.gotTrackingQuantity}` || '',
          trackingPush: `${m.actualPushQuantity}/${m.expectedPushQuantity}` || '',
        };
      });

      const title = dateFormat + 'InternalMonitor';
      const buffer = dataConvertToImage(title, columnNames, data);

      const bucket = this.configService.get('Bucket').cms;
      const s3Path = `tracking/daily_internal_monitor/内部监控日报-${dateFormat}.png`;
      await this.awsService.uploadFile(buffer, s3Path, bucket);

      const s3Url = await this.awsService.getSignedUrl(s3Path, bucket, 0);
      const content = `![${title}](${s3Url})`;
      this.xPushService.sendDingDing(content, 'tracking', null, true).then();
    } catch (e) {
      this.xPushService.sendDingDing(e.message, 'tracking', null, true).then();
    }
  }
}
