import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reconciliation } from '@/domain/scb/reconciliation/entities/reconciliation.entity';
import { ReconciliationService } from './reconciliation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reconciliation]), AwsModule, ConfigModule],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
