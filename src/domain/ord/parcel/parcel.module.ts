import { HttpModule, Module } from '@nestjs/common';
import { ParcelService } from '@/domain/ord/parcel/service/parcel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { ParcelCreateValidationService } from '@/domain/ord/parcel/service/parcel-create-validation.service';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { ParcelColissimoService } from '@/domain/ord/parcel/service/parcel-colissimo.service';
import { ParcelAddressRestrictionService } from '@/domain/ord/parcel/service/parcel-address-restriction.service';
import { ExternalModule } from '@/domain/external/external.module';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { CoreModule } from '@/domain/sct/core/core.module';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { BullModule } from '@nestjs/bull';
import { ParcelShipmentLabelProcess } from '@/domain/ord/parcel/service/parcel-shipment-label.process';
import { ParcelShipmentInvoiceProcess } from '@/domain/ord/parcel/service/parcel-shipment-invoice.process';
import { TrackingNumberPool } from '@/domain/ord/parcel/entity/trackingNumberPool.entity';
import { ParcelAll } from '@/domain/ord/parcel/entity/parcel-all.entity';
import { TrackingAll } from '@/domain/sct/core/entity/tracking-all.entity';
import { PlatformModule } from '@/domain/base/ssm/platform/platform.module';
import { TransporterModule } from '@/domain/sci/transporter/transporter.module';
import { LastmileProviderModule } from '@/domain/sci/lastmile-provider/lastmile-provider.module';
import { AddressRestrictionModule } from '@/domain/cam/address-restriction/address-restriction.module';
import { TransporterZoneModule } from '@/domain/sci/transporter-zone/transporter-zone.module';

@Module({
  providers: [
    ParcelService,
    ParcelCreateValidationService,
    ConfigService,
    ParcelColissimoService,
    ParcelAddressRestrictionService,
    ParcelExtendService,
    ParcelShipmentLabelProcess,
    ParcelShipmentInvoiceProcess,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Parcel,
      TrackingNumberPool,
      CamChannel,
      RequestLog,
      Tracking,
      Account,
      ParcelRepository,
      ParcelAll,
      TrackingAll,
    ]),
    AwsModule,
    ClientModule,
    ExternalModule,
    CoreModule,
    PlatformModule,
    TransporterModule,
    AddressRestrictionModule,
    LastmileProviderModule,
    TransporterZoneModule,
    BullModule.registerQueue({
      name: 'SHIPMENT_UPLOAD_LABEL',
    }),
    BullModule.registerQueue({
      name: 'SHIPMENT_UPLOAD_INVOICE',
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ParcelService, ParcelExtendService],
})
export class ParcelModule {}
