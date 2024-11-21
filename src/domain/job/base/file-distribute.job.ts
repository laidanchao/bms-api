import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { FtpJob } from '@/domain/job/base/ftp.job';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 将文件移动到指定位置 用于后续处理
 */
@Injectable()
export class FileDistributeJob extends FtpJob {
  constructor(xPushService: XPushService, configService: ConfigService) {
    super(xPushService, configService);
  }

  async _handleFile(file, source) {
    if (this.isTrackingFile(file)) {
      await this.ftpClient.rename(`${source}/${file.name}`, `/local/tracking/Wait Extract/${file.name}`);
    }
    if (this.isInvoiceFile(file)) {
      await this.ftpClient.rename(`${source}/${file.name}`, `/local/invoice/Wait Extract/${file.name}`);
    }
    if (this.isDatFileAndNotInvoiceTemp(file)) {
      await this.ftpClient.rename(`${source}/${file.name}`, `/local/dat/Wait Extract/${file.name}`);
    }
  }

  private isTrackingFile(file): boolean {
    return file.name.endsWith('.ok') && !file.name.startsWith('INVOIC');
  }
  private isInvoiceFile(file): boolean {
    return file.name.startsWith('INVOIC');
  }
  private isDatFileAndNotInvoiceTemp(file): boolean {
    return file.name.endsWith('.dat') && file.name.startsWith('PR_CLP_SMALL');
  }
}
