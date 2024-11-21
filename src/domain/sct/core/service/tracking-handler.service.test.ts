import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { CoreModule } from '@/domain/sct/core/core.module';

describe('TrackingHandlerService ', () => {
  let app: INestApplication;
  let trackingHandlerService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration, ormConfig],
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
        CoreModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    trackingHandlerService = await module.resolve(TrackingHandlerService);
  });

  // 更新已签收状态
  // 包裹已签收，又收到DELIVERING轨迹过来时，包裹是否保持已签收
  it('handleTracing-arrivedAt-DELIVERING', async () => {
    const trackingNumber = 'CC10500001010202S';
    const deliveringAt = '2022-12-12 16:28:09.247+00';
    const arrivedAt = '2022-12-12 19:00:45.588+00';

    const parcel = {
      trackingNumber,
      transporter: 'COLICOLI',
      status: 'ARRIVED',
      lastDescription: null,
      lastEvent: null,
      lastTimestamps: null,
      transferredAt: null,
      arrivedAt: null,
      aging: null,
      isArrived: null,
      returnedAt: null,
      isReturned: null,
    } as Parcel;

    const trackingArray = [
      {
        trackingNumber,
        timestamp: deliveringAt,
        description: '包裹到达Colicoli中转中心',
        event: 'AARCFM', // 对应DELIVERING
      },
      {
        trackingNumber,
        timestamp: arrivedAt,
        description: '包裹交自提点',
        event: 'PAQPAR', // 对应ARRIVED
      },
    ];

    const result = await trackingHandlerService.handleTracing(parcel, trackingArray);
    expect(result.status).toEqual('ARRIVED');
    expect(result.arrivedAt).toEqual(arrivedAt);
  });

  // 更新上网时间
  // 有DELIVERING轨迹时，包裹是否取最早一条timestamp更新为上网时间
  it('handleTracing-transferredAt ', async () => {
    const trackingNumber = 'CC10500001010202S';
    const transferredAt1 = '2022-12-12 16:00:45.588+00';
    const transferredAt2 = '2022-12-12 19:28:09.247+00';

    const parcel = {
      trackingNumber,
      transporter: 'COLICOLI',
      status: 'CREATED',
      lastDescription: null,
      lastEvent: null,
      lastTimestamps: null,
      transferredAt: null,
      arrivedAt: null,
      aging: null,
      isArrived: null,
      returnedAt: null,
      isReturned: null,
    } as Parcel;

    const trackingArray = [
      {
        trackingNumber,
        timestamp: transferredAt1,
        description: '包裹到达Colicoli中转中心',
        event: 'AARCFM', // 对应DELIVERING
      },
      {
        trackingNumber,
        timestamp: transferredAt2,
        description: '包裹正在运输途中',
        event: 'EXPCFM', // 对应DELIVERING
      },
    ];

    const result = await trackingHandlerService.handleTracing(parcel, trackingArray);
    expect(result.status).toEqual('DELIVERING');
    expect(result.transferredAt).toEqual(transferredAt1);
  });

  // 更新已签收状态
  // 有ARRIVED轨迹且后续又出现DELIVERING轨迹时，包裹状态是否会更新为已签收
  it('handleTracing-arrivedAt', async () => {
    const trackingNumber = 'CC10500001010202S';
    const arrivedAt = '2022-12-12 20:00:45.588+00';

    const parcel = {
      trackingNumber,
      transporter: 'COLICOLI',
      status: 'CREATED',
      lastDescription: null,
      lastEvent: null,
      lastTimestamps: null,
      transferredAt: null,
      arrivedAt: null,
      aging: null,
      isArrived: null,
      returnedAt: null,
      isReturned: null,
    } as Parcel;

    const trackingArray = [
      {
        trackingNumber,
        timestamp: '2022-12-12 19:00:09.247+00',
        description: '包裹到达Colicoli中转中心',
        event: 'AARCFM', // 对应DELIVERING
      },
      {
        trackingNumber,
        timestamp: arrivedAt,
        description: '包裹交自提点',
        event: 'PAQPAR', // 对应ARRIVED
      },
    ];

    const result = await trackingHandlerService.handleTracing(parcel, trackingArray);
    expect(result.status).toEqual('ARRIVED');
    expect(result.arrivedAt).toEqual(arrivedAt);
  });
});
