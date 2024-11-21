import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { MetadataExtractService } from '@/domain/job/sct/service/metadata-extract.service';
import { FtpJob } from '@/domain/job/base/ftp.job';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 将法邮轨迹文件上传到s3
 */
@Injectable()
export class CMTrackingExtractJob extends FtpJob {
  constructor(
    xPushService: XPushService,
    @Inject(ConfigService) configService: ConfigService,
    private metadataExtractService: MetadataExtractService,
  ) {
    super(xPushService, configService);
  }

  async _handleFile(file, source) {
    await this.metadataExtractService.extractTracking(file, this.ftpClient, 'COLISSIMO', {
      sourcePath: `${source}/${file.name}`,
      extractedPath: `${this.configService.get('CMTrackingExtractJob').ftp.extracted}/${file.name}`,
      s3Path: `tracking/sftp_source_file/colissimo/${file.name.split('.')[0]}/${file.name}`,
      bucket: this.configService.get('Bucket').cms,
    });
  }
}
