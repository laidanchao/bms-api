import { Module } from '@nestjs/common';
import { PlatformModule } from '@/domain/base/ssm/platform/platform.module';
import { SystemVariableModule } from '@/domain/base/ssm/system/system-variable.module';

@Module({
  imports: [PlatformModule, SystemVariableModule],
  exports: [PlatformModule, SystemVariableModule],
})
export class SsmModule {}
