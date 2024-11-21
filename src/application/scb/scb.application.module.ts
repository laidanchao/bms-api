import { Module } from '@nestjs/common';
import { ScbModule } from '@/domain/scb/scb.module';
import { BillController } from '@/application/scb/bill.controller';
import { BillDetailController } from '@/application/scb/bill-detail.controller';
import { BmsController } from '@/application/scb/bms.controller';
import { SurchargePriceController } from '@/application/scb/surcharge-price.controller';
import { FuelRateController } from '@/application/scb/fuel-rate.controller';
import { CamModule } from '@/domain/cam/cam.module';
import { OrdModule } from '@/domain/ord/ord.module';
import { SrsModule } from '@/domain/srs/srs.module';
import { InvoiceLogController } from '@/application/scb/invoice-log.controller';
import { ScbInvoiceController } from '@/application/scb/invoice.controller';
import { ReconciliationController } from '@/application/scb/reconciliation.controller';

@Module({
  imports: [ScbModule, CamModule, OrdModule, SrsModule],
  controllers: [
    BillController,
    BillDetailController,
    BmsController,
    SurchargePriceController,
    FuelRateController,
    InvoiceLogController,
    ScbInvoiceController,
    ReconciliationController,
  ],
})
export class ScbApplicationModule {}
