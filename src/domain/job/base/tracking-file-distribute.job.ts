import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { FtpJob } from '@/domain/job/base/ftp.job';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 将ftp上的文件移动到指定位置用于后续处理
 */
@Injectable()
export class TrackingFileDistributeJob extends FtpJob {
  constructor(xPushService: XPushService, configService: ConfigService) {
    super(xPushService, configService);
  }

  async _handleFile(file, source) {
    if (this.isTrackingFile(file)) {
      await this.ftpClient.rename(`${source}/${file.name}`, `/local/tracking/Wait Extract/${file.name}`);
    }
  }

  private isTrackingFile(file): boolean {
    return file.name.endsWith('.ok') && !file.name.startsWith('INVOIC');
  }
}
