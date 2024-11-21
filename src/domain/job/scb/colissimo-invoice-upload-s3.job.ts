import { FtpJob } from '@/domain/job/base/ftp.job';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsService } from '@/domain/external/aws/aws.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { ScbInvoiceService } from '@/domain/scb/invoice/invoice.service';

/**
 * 上传法邮账单文件到s3
 */
@Injectable()
export class ColissimoInvoiceUploadS3Job extends FtpJob {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    private awsService: AwsService,
    xPushService: XPushService,
    @Inject(ScbInvoiceService) private scbInvoiceService: ScbInvoiceService,
  ) {
    super(xPushService, configService);
    this.config = configService.get(ColissimoInvoiceUploadS3Job.name);
  }

  async _handleFile(file, source): Promise<void> {
    if ('INVOIC' !== file.name.split('.')[0] || 'ok' !== file.name.split('.')[4]) {
      return;
    }
    // 拿文件的信息 组装metadata 保存
    const invoice = this.scbInvoiceService.buildCMInvoiceInfo(file);
    await this.scbInvoiceService.create(invoice);
    // 上传S3
    const fileData = await this.ftpClient.get(`${source}/${file.name}`);
    const bucket = this.configService.get('Bucket').cms;
    await this.awsService.uploadFile(fileData, invoice.originalFileUrl, bucket);
    await this.xPushService.sendDingDing(`收到法邮账单文件文件，S3 key: ${invoice.originalFileUrl}`, 'bill');
    // 移动到 uploaded 目录
    await this.ftpClient.rename(`${source}/${file.name}`, `${this.config.ftp.uploaded}/${file.name}`);
  }
}
