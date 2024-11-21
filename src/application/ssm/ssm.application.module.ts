import { Module } from '@nestjs/common';
import { SsmModule } from '@/domain/base/ssm/ssm.module';
import { PlatformController } from '@/application/ssm/application.controller';

@Module({
  imports: [SsmModule],
  controllers: [PlatformController],
  exports: [SsmModule],
})
export class SsmApplicationModule {}
