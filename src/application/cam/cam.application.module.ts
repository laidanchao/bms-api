import { Module } from '@nestjs/common';
import { AccountController } from '@/application/cam/account.controller';
import { ChannelController } from '@/application/cam/channel.controller';
import { CamModule } from '@/domain/cam/cam.module';
import { SenderAddressController } from '@/application/cam/sender-address.controller';
import { AddressRestrictionController } from '@/application/cam/address-restriction.controller';

@Module({
  imports: [CamModule],
  controllers: [AccountController, ChannelController, SenderAddressController, AddressRestrictionController],
  exports: [CamModule],
})
export class CamApplicationModule {}
