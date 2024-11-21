import { Module } from '@nestjs/common';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigModule } from '@nestjs/config';
import awsConfig from './aws.config';

@Module({
  providers: [AwsService],
  exports: [AwsService],
  imports: [ConfigModule.forFeature(awsConfig)],
})
export class AwsModule {}
