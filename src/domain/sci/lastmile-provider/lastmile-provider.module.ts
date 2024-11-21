import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';
import { LastmileProviderModificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-modification.service';
import { LastmileProviderIdentification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-identification.entity';
import { LastmileProviderIdentificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-identification.service';
import { ExternalModule } from '@/domain/external/external.module';
import { LastmileProviderModificationRepository } from '@/domain/sci/lastmile-provider/repository/lastmile-provider-modification.repository';
import { LastmileProvider } from '@/domain/sci/lastmile-provider/entity/lastmile-provider.entity';
import { LastmileProviderService } from '@/domain/sci/lastmile-provider/service/lastmile-provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LastmileProviderModification,
      LastmileProviderIdentification,
      LastmileProviderModificationRepository,
      LastmileProvider,
    ]),
    ExternalModule,
  ],
  providers: [LastmileProviderModificationService, LastmileProviderIdentificationService, LastmileProviderService],
  exports: [LastmileProviderModificationService, LastmileProviderIdentificationService, LastmileProviderService],
})
export class LastmileProviderModule {}
