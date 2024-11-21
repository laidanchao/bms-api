import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import configuration from '@/app/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';

describe('configuration', () => {
  let app: INestApplication;
  let configService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
          load: [configuration, ormConfig],
        }),
        TypeOrmModule.forRoot(ormConfig()),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    configService = await module.resolve(ConfigService);
  });

  it('should config', function() {
    const result = configService.get('CMTrackingExtractFromFTP');
    expect(result).toMatchObject({
      ftp: {
        protocol: 'sftp',
        host: 'sftp.ftl-oms.com',
        port: '22',
        username: 'colissimo-test',
        password: 'qasdfrew',
        source: '/local/pushAgain',
      },
    });
    const result1 = configService.get('forJunitTest');
    expect(result1).toMatchObject({
      username: 'test',
    });
  });
});
