import { Module } from '@nestjs/common';
import { SciModule } from '@/domain/sci/sci.module';

@Module({
  imports: [SciModule],
  exports: [SciModule],
})
export class SciCnApplicationModule {}
