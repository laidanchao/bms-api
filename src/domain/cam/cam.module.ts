import { Module } from '@nestjs/common';
import { TransporterModule } from '@/domain/sci/transporter/transporter.module';
import { ChannelModule } from '@/domain/cam/channel/channel.module';
import { AccountModule } from '@/domain/cam/account/account.module';
import { SenderAddressModule } from '@/domain/cam/sender-address/sender-address.module';
import { AddressRestrictionModule } from '@/domain/cam/address-restriction/address-restriction.module';

@Module({
  imports: [TransporterModule, ChannelModule, AccountModule, SenderAddressModule, AddressRestrictionModule],
  exports: [ChannelModule, AccountModule, SenderAddressModule, AddressRestrictionModule],
})
export class CamModule {}
