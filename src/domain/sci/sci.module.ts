import { Module } from '@nestjs/common';
import { TransporterModule } from '@/domain/sci/transporter/transporter.module';
import { TransporterMethodsModule } from '@/domain/sci/transporter-method/transporter-methods.module';
import { TransporterZoneModule } from '@/domain/sci/transporter-zone/transporter-zone.module';
import { LastmileProviderModule } from '@/domain/sci/lastmile-provider/lastmile-provider.module';

@Module({
  imports: [TransporterModule, TransporterMethodsModule, TransporterZoneModule, LastmileProviderModule],
  exports: [TransporterModule, TransporterMethodsModule, TransporterZoneModule, LastmileProviderModule],
})
export class SciModule {}
