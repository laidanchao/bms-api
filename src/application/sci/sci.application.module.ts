import { Module } from '@nestjs/common';
import { TransporterController } from '@/application/sci/transporter.controller';
import { TransporterMethodsController } from '@/application/sci/transporter-methods.controller';
import { ProductController } from '@/application/sci/product.controller';
import { LabelFormatController } from '@/application/sci/label-format.controller';
import { TransporterZoneController } from '@/application/sci/transporter-zone.controller';
import { SciModule } from '@/domain/sci/sci.module';
import { TransporterApiController } from '@/application/sci/transporter-api.controller';
import { LastmileProviderIdentificationController } from '@/application/sci/lastmile-provider-identification.controller';
import { LastmileProviderModificationController } from '@/application/sci/lastmile-provider-modification.controller';
import { LastmileProviderController } from '@/application/sci/lastmile-provider.controller';

@Module({
  imports: [SciModule],
  controllers: [
    TransporterController,
    TransporterMethodsController,
    ProductController,
    LabelFormatController,
    TransporterApiController,
    LastmileProviderIdentificationController,
    LastmileProviderModificationController,
    TransporterZoneController,
    LastmileProviderController,
  ],
})
export class SciApplicationModule {}
