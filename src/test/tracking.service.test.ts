import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { SctModule } from '../domain/sct/sct.module';

describe('TrackingService test', () => {
  let trackingService;
  let app;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
        SctModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    trackingService = await module.resolve(TrackingService);
  });

  it('filter tracking by dataSource', () => {
    const trackingArray: any = [
      {
        event: 'aaa',
        timestamp: '2021-01-01 00:00:00',
        fromFile: true,
      },
      {
        event: 'bbb',
        timestamp: '2021-01-01 01:00:00',
        fromFile: true,
      },
      {
        event: 'ccc',
        timestamp: '2021-01-01 00:00:00',
        fromFile: false,
      },
      {
        event: 'ddd',
        timestamp: '2021-01-02 01:00:00',
        fromFile: false,
      },
      {
        event: 'eee',
        timestamp: '2021-01-03 01:00:00',
        fromFile: true,
      },
      {
        event: 'fff',
        timestamp: '2021-01-03 01:00:00',
        fromFile: false,
      },
      {
        event: 'ggg',
        timestamp: '2021-01-04 01:00:00',
        fromFile: false,
      },
    ];
    const trackingFileTrackingArray = trackingService.filterTrackingByDataSources(trackingArray, 'TRACKING_FILE');
    const webSiteTrackingArray = trackingService.filterTrackingByDataSources(trackingArray, 'WEB_SITE');
    const mergedTrackingArray = trackingService.filterTrackingByDataSources(trackingArray);
    expect(trackingFileTrackingArray.length).toEqual(3);
    expect(webSiteTrackingArray.length).toEqual(4);
    expect(mergedTrackingArray.length).toEqual(5);
  });
});
