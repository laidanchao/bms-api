import { Module } from '@nestjs/common';
import { ParcelProofModule } from '@/domain/ord/parcel-proof/parcel-proof.module';
import { ParcelProofController } from '@/application/ord/parcel-proof.controller';

@Module({
  imports: [ParcelProofModule],
  controllers: [ParcelProofController],
})
export class ParcelProofApplicationModule {}
