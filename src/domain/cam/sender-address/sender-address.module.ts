import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CamSenderAddress } from '@/domain/cam/sender-address/entity/sender-address.entity';
import { SenderAddressService } from '@/domain/cam/sender-address/service/sender-address.service';
import { NacosModule } from '@/domain/external/nacos/nacos.module';

@Module({
  imports: [TypeOrmModule.forFeature([CamSenderAddress]), NacosModule],
  providers: [SenderAddressService],
  exports: [SenderAddressService],
})
export class SenderAddressModule {}
