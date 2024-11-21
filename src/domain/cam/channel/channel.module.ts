import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { ChannelService } from '@/domain/cam/channel/channel.service';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  providers: [ChannelService],
  imports: [TypeOrmModule.forFeature([CamChannel]), ExternalModule],
  exports: [ChannelService],
})
export class ChannelModule {}
