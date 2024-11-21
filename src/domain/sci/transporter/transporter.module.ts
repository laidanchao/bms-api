import { Module } from '@nestjs/common';
import { TransporterService } from '@/domain/sci/transporter/service/transporter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { TransporterRepository } from '@/domain/sci/transporter/transporter.repository';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigService } from '@nestjs/config';
import { LabelFormatService } from '@/domain/sci/transporter/service/label-format.service';
import { ProductService } from '@/domain/sci/transporter/service/product.service';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { TransporterApiService } from '@/domain/sci/transporter/service/transporter-api.service';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  providers: [
    TransporterService,
    ConfigService,
    LabelFormatService,
    ProductService,
    TransporterApiService,
    RedisCacheNewService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Transporter,
      LabelFormat,
      Account,
      TransporterProduct,
      TransporterRepository,
      TransporterApi,
    ]),
    AwsModule,
    ClientModule,
    ExternalModule,
  ],
  exports: [TransporterService, LabelFormatService, ProductService, ClientModule, TransporterApiService],
})
export class TransporterModule {}
