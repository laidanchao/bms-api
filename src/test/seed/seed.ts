import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import {
  applications,
  channels,
  labelFormats,
  parcels,
  trackings,
  transporterAccounts,
  transporterProducts,
  transporters,
  webhooks,
} from '@/test/seed/data';
import { Logger } from '@nestjs/common';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { ParcelPush } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';

/**
 * TODO 重构插入方法
 * 初始化数据操作
 */
export class Seeds1544303473346 implements MigrationInterface {
  private logger = new Logger('seed');
  public async up(queryRunner: QueryRunner): Promise<any> {
    this.logger.log('start seed data');

    const { connection } = queryRunner;

    const webhookRepo: Repository<ParcelPush> = connection.getRepository(ParcelPush);
    await webhookRepo.save(webhooks);

    const parcelRepo: Repository<Parcel> = connection.getRepository(Parcel);
    await parcelRepo.save(parcels);

    const trackingRepository: Repository<Tracking> = connection.getRepository(Tracking);
    await trackingRepository.save(trackings);

    const transporterRepo: Repository<Transporter> = connection.getRepository(Transporter);
    await transporterRepo.save(transporters);

    const transporterProductRepo: Repository<TransporterProduct> = connection.getRepository(TransporterProduct);
    await transporterProductRepo.save(transporterProducts);

    const transporterAccountRepo: Repository<Account> = connection.getRepository(Account);
    await transporterAccountRepo.save(transporterAccounts);

    const applicationRepo: Repository<Platform> = connection.getRepository(Platform);
    await applicationRepo.save(applications);

    const channelRepo: Repository<CamChannel> = connection.getRepository(CamChannel);
    await channelRepo.save(channels);

    const labelRepo: Repository<LabelFormat> = connection.getRepository(LabelFormat);
    await labelRepo.save(labelFormats);

    this.logger.log('seed data end');
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.clearDatabase('cms');
  }
}
