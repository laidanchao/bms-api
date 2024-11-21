import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalModule } from '@/domain/external/external.module';
import { AddressRestriction } from '@/domain/cam/address-restriction/entity/address-restriction.entity';
import { AddressRestrictionService } from '@/domain/cam/address-restriction/service/address-restriction.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddressRestriction]), ExternalModule],
  providers: [AddressRestrictionService],
  exports: [AddressRestrictionService],
})
export class AddressRestrictionModule {}
