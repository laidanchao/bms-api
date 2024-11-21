import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import FTP from '@softbrains/ftp';
import moment from 'moment';
import { MoreThan } from 'typeorm';

export class InvoicePushListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    @Inject(ConfigService) private configService: ConfigService,
    private parcelService: ParcelExtendService,
    private xPushService: XPushService,
    private awsService: AwsService,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('CMS_INVOICE_PUSH', this);
    Logger.log('CMS_INVOICE_PUSH subscribe success');
  }

  @SubscribeTo('CMS_INVOICE_PUSH')
  async invoicePushConsumer(@Payload() data: any) {
    const { s3Path, trackingNumber } = JSON.parse(data).body;
    const halfYearBefore = moment()
      .subtract(6, 'month')
      .format('YYYY-MM-DD');
    const parcel = await this.parcelService.findOne({
      trackingNumber,
      createdAt: MoreThan(halfYearBefore),
    });

    const { transporter, transporterAccountId, shippingNumber } = parcel;

    try {
      const cmsBucket = this.configService.get('Bucket').cms;
      const buffer = await this.awsService.download(s3Path, cmsBucket);

      const ftpConfig = this.configService.get(`${transporter}_Invoice.ftp`);
      const fileName = `INV_EXP_${transporterAccountId}_${shippingNumber}.PDF`;
      const path = `${ftpConfig.source}/${fileName}`;
      await this.putToFTP(ftpConfig, buffer, path);
    } catch (e) {
      Logger.error(e);
      this.xPushService.sendDingDing(`推送发票给${transporter}(${trackingNumber})出现异常 ${e.message}`).then();
    }
  }

  private async putToFTP(ftpConfig: any, buffer: any, path: string) {
    const ftpClient = new FTP();
    await ftpClient.connect(ftpConfig);
    await ftpClient.put(buffer, path);
    await ftpClient.end();
  }
}
