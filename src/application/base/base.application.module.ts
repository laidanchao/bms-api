import { Module } from '@nestjs/common';
import { AttachmentController } from '@/application/base/attachment.controller';
import { HealthController } from '@/application/base/health.controller';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { TestController } from '@/application/base/test.controller';

@Module({
  imports: [AwsModule, ConfigModule],
  controllers: [AttachmentController, HealthController, TestController],
})
export class BaseApplicationModule {}
