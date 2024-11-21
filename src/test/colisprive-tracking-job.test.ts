import { INestApplication } from '@nestjs/common';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from '@/domain/job/job.module';
import { ParcelModule } from '@/domain/ord/parcel/parcel.module';
import configuration from '@/app/config/configuration';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import { SctModule } from '@/domain/sct/sct.module';

describe.skip('colisprive tracking job', () => {
  let app: INestApplication;
  let parcelRepository: ParcelRepository;
  let trackingRepository: TrackingRepository;

  // init testing module and data
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration, ormConfig],
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
        JobModule,
        SctModule,
        ParcelModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    parcelRepository = await module.resolve(ParcelRepository);
    trackingRepository = await module.resolve(TrackingRepository);
  });

  it('execute() ', async () => {
    // check result
    const tracking = await trackingRepository.findOne({
      where: { trackingNumber: '1D0001194507' },
    });
    expect(tracking).toMatchObject({
      trackingNumber: '1D0001194507',
      event: '029110',
      description: 'Colis mis en distribution',
      timestamp: new Date('2013-09-26T04:22:00.000Z'),
      fileName: 'colisprive_test.dat-:1D0001194507',
    });
    expect(!!tracking.createdAt).toBeTruthy();
    expect(!!tracking.updatedAt).toBeTruthy();

    const query = { where: { trackingNumber: '1D0001194507' } };
    const parcel = await parcelRepository.findOne(query);
    expect(parcel).toMatchObject({
      trackingNumber: '1D0001194507',
      lastEvent: '029110',
      lastDescription: 'Colis mis en distribution',
      status: 'DELIVERING',
      sync: false,
    });
  });
});
