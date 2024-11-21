import { Module } from '@nestjs/common';
import { InvoiceLogModule } from '@/domain/scb/invoice-log/invoice-log.module';
import { SurchargePriceModule } from '@/domain/scb/surcharge-price/surcharge-price.module';
import { FuelRateModule } from '@/domain/scb/fuel-rate/fuel-rate.module';
import { BillModule } from '@/domain/scb/bill/bill.module';
import { ScbInvoiceModule } from '@/domain/scb/invoice/invoice.module';
import { ReconciliationModule } from '@/domain/scb/reconciliation/reconciliation.module';

@Module({
  imports: [InvoiceLogModule, BillModule, FuelRateModule, SurchargePriceModule, ScbInvoiceModule, ReconciliationModule],
  exports: [InvoiceLogModule, BillModule, FuelRateModule, SurchargePriceModule, ScbInvoiceModule, ReconciliationModule],
})
export class ScbModule {}
