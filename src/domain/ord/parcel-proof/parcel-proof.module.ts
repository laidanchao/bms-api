import { Module } from '@nestjs/common';
import { ParcelProofService } from '@/domain/ord/parcel-proof/service/parcel-proof.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ParcelProof } from '@/domain/ord/parcel-proof/entity/parcel-proof.entity';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { XPushModule } from '@/domain/external/xpush/x-push.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParcelProof]), ConfigModule, AwsModule, XPushModule],
  providers: [ParcelProofService],
  exports: [ParcelProofService],
})
export class ParcelProofModule {}
