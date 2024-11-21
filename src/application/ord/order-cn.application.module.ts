import { Module } from '@nestjs/common';
import { OrdModule } from '@/domain/ord/ord.module';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { ParcelCnController } from '@/application/ord/parcel-cn.controller';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  imports: [OrdModule, AwsModule, ConfigModule, ExternalModule],
  controllers: [ParcelCnController],
})
export class OrderCnApplicationModule {}
