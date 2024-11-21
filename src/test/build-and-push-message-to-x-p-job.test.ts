import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from '@/domain/job/job.module';
import { ParcelModule } from '@/domain/ord/parcel/parcel.module';
import { ParcelPushJob } from '@/domain/job/npm/parcel-push.job';
import { SctModule } from '@/domain/sct/sct.module';

describe.skip('BuildAndPushMessageToXPJob test', function() {
  let app: INestApplication;
  let buildAndPushMessageToXPJob: ParcelPushJob;

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
    buildAndPushMessageToXPJob = await module.resolve(ParcelPushJob);
  });

  it('BuildAndPushMessageToXPJob success', async function() {
    await buildAndPushMessageToXPJob.execute();
  });
});
