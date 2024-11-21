import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { InvoiceLogService } from '@/domain/scb/invoice-log/invoice-log.service';
import { InvoiceLog } from '@/domain/scb/invoice-log/entities/invoice-log.entity';
import { BullModule } from '@nestjs/bull';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Module({
  providers: [XPushService, InvoiceLogService],
  imports: [
    TypeOrmModule.forFeature([InvoiceLog]),
    AwsModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'bill',
    }),
  ],
  exports: [InvoiceLogService],
})
export class InvoiceLogModule {}
