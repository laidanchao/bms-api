import { OnQueueCompleted, OnQueueError, Process, Processor } from '@nestjs/bull';
import { ParcelService } from '@/domain/ord/parcel/service/parcel.service';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
const logger = new Logger('SHIPMENT_UPLOAD_INVOICE');

@Processor('SHIPMENT_UPLOAD_INVOICE')
export class ParcelShipmentInvoiceProcess {
  constructor(private service: ParcelService) {}

  @Process()
  async process(job: Job<unknown>) {
    const data: any = job.data;
    try {
      await this.service._uploadInvoiceToS3(data.result, data.options);
    } catch (e) {
      logger.error(e.message);
    }
    return {};
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job) {
    Logger.log(`Finish job ${job.id} of type SHIPMENT_UPLOAD_INVOICE`);
  }

  @OnQueueError()
  OnQueueError(job: Job) {
    if (job.failedReason) {
      Logger.log(`Error job ${job.id} of type SHIPMENT_UPLOAD_INVOICE message ${job.failedReason}`);
    }
  }
}
