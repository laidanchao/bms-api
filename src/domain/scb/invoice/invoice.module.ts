import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScbInvoiceService } from '@/domain/scb/invoice/invoice.service';
import { ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';
import { ExternalModule } from '@/domain/external/external.module';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { OmsModule } from '@/domain/external/oms/oms.module';

@Module({
  providers: [XPushService, ScbInvoiceService],
  imports: [
    TypeOrmModule.forFeature([ScbInvoice]),
    AwsModule,
    ConfigModule,
    ExternalModule,
    OmsModule,
    BullModule.registerQueue({
      name: 'bill',
    }),
  ],
  exports: [ScbInvoiceService],
})
export class ScbInvoiceModule {}
