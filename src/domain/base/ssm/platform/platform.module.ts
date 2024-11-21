import { Module } from '@nestjs/common';
import { PlatformService } from '@/domain/base/ssm/platform/platform.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  providers: [PlatformService],
  imports: [TypeOrmModule.forFeature([Platform]), ExternalModule],
  exports: [PlatformService],
})
export class PlatformModule {}
