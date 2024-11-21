import { GlsEsBroker } from '@/domain/sci/transporter/broker/gls-es/gls-es.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { defaultShipment, glsEsClient } from '@/domain/sci/transporter/contants';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';

const config: BaseConfig = {
  accountInfo: glsEsClient,
  shipmentUrl: 'https://wsclientes.asmred.com/b2b.asmx?wsdl',
  productCode: '74',
  labelFormat: {
    value: 'PDF',
    labelType: 'pdf',
  },
};

describe('spain gls test', () => {
  let client;
  let app: INestApplication;
  const transporter = 'GlsEs';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration, ormConfig],
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
        ClientModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    client = await module.resolve(GlsEsBroker);
  });

  it('create label', async () => {
    const result = await client.create(defaultShipment, config);
    expect(result).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });
});
