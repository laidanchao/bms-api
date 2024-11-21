import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobModule } from '@/domain/job/job.module';
import configuration from '@/app/config/configuration';
import { ColispriveUpdateZipcodesJob } from '@/domain/job/sci/colisprive-update-zipcodes.job';

describe.skip('ColispriveUpdateZipcodesJob test', () => {
  let app: INestApplication;
  let colispriveUpdateZipcodesJob: ColispriveUpdateZipcodesJob;

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
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    colispriveUpdateZipcodesJob = await module.resolve(ColispriveUpdateZipcodesJob);
  });

  it('execute() test', async () => {
    // do job
    await colispriveUpdateZipcodesJob.execute();
  });
});
