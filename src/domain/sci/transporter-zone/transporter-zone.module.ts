import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransporterZone } from '@/domain/sci/transporter-zone/entity/transporter-zone.entity';
import { TransporterZoneRepository } from '@/domain/sci/transporter-zone/repository/transporter-zone.repository';
import { TransporterZoneService } from '@/domain/sci/transporter-zone/transporter-zone.service';
import { ExternalModule } from '@/domain/external/external.module';
@Module({
  providers: [TransporterZoneService],
  imports: [TypeOrmModule.forFeature([TransporterZone, TransporterZoneRepository]), ExternalModule],
  exports: [TransporterZoneService],
})
export class TransporterZoneModule {}
