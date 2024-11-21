import { Module } from '@nestjs/common';
import { CamModule } from '@/domain/cam/cam.module';

@Module({
  imports: [CamModule],
  exports: [CamModule],
})
export class CamCnApplicationModule {}
