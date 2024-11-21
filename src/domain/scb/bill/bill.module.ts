import { Module } from '@nestjs/common';
import { BillService } from '@/domain/scb/bill/service/bill.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { BillSurchargeEntity } from '@/domain/scb/bill/entity/bill-surcharge.entity';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { IndemnityDetail } from '@/domain/scb/bill/entity/indemnity-detail.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { ConfigModule } from '@nestjs/config';
import { BillRepository } from '@/domain/scb/bill/repository/bill.repository';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { BillDetailService } from '@/domain/scb/bill/service/bill-detail.service';
import { BillSurchargeService } from '@/domain/scb/bill/service/bill-surcharge.service';
import { BillDetailRepository } from '@/domain/scb/bill/repository/bill-detail.repository';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { IndemnityDetailRepository } from '@/domain/scb/bill/repository/indemnity-detail.repository';
import { BullModule } from '@nestjs/bull';
import { InvoiceLogModule } from '@/domain/scb/invoice-log/invoice-log.module';
import { ScbInvoiceModule } from '@/domain/scb/invoice/invoice.module';
import { SystemVariableModule } from '@/domain/base/ssm/system/system-variable.module';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  providers: [BillService, BillDetailService, BillSurchargeService, XPushService],
  exports: [BillService, BillDetailService],
  imports: [
    TypeOrmModule.forFeature([
      Bill,
      BillRepository,
      BillDetail,
      BillSurchargeEntity,
      IndemnityDetail,
      FuelRate,
      Parcel,
      BillDetailRepository,
      IndemnityDetailRepository,
    ]),
    AwsModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'bill',
    }),
    SystemVariableModule,
    InvoiceLogModule,
    ScbInvoiceModule,
    ExternalModule,
  ],
})
export class BillModule {}
