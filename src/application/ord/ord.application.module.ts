import { Module } from '@nestjs/common';
import { ParcelController } from '@/application/ord/parcel.controller';
import { ParcelAgingController } from '@/application/ord/parcel-aging.controller';
import { RequestLogController } from '@/application/ord/request-log.controller';
import { OrdModule } from '@/domain/ord/ord.module';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { OmsModule } from '@/domain/external/oms/oms.module';

@Module({
  imports: [OrdModule, AwsModule, ConfigModule, OmsModule, TypeOrmModule.forFeature([ParcelRepository])],
  controllers: [ParcelController, ParcelAgingController, RequestLogController],
})
export class OrdApplicationModule {}
