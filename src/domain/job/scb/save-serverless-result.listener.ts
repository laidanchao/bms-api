import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { BillService } from '@/domain/scb/bill/service/bill.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { InvoiceTypeEnum } from '@/domain/scb/invoice/entities/invoice.entity';

export class SaveServerlessResultListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    private readonly xPushService: XPushService,
    private billService: BillService,
  ) {}

  /**
   * 存储 serverless 解析后的账单数据
   */
  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('SERVERLESS_INVOICE_RESULT_TOPIC', this);
    Logger.log('SERVERLESS_INVOICE_RESULT_TOPIC subscribe success');
  }

  @SubscribeTo('SERVERLESS_INVOICE_RESULT_TOPIC')
  async saveServerlessResult(@Payload() data: any) {
    console.log('SERVERLESS_INVOICE_RESULT_TOPIC 被触发', data);
    const result = JSON.parse(data);
    switch (result.billType) {
      case InvoiceTypeEnum.colissimo:
      case InvoiceTypeEnum.colicoli:
      case InvoiceTypeEnum.colisprive:
      case InvoiceTypeEnum.ccIndemnity:
      case InvoiceTypeEnum.cnIndemnity:
      case InvoiceTypeEnum.cainiao:
      case InvoiceTypeEnum.express37: {
        await this.billService.handleScbServerlessResult(result);
        return 'success';
      }
      default: {
        await this.xPushService.sendDingDing(`### 出现不明确的账单类型${result.billType}`, 'bill');
        return 'success';
      }
    }
  }
}
