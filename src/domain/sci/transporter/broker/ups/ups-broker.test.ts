import { UpsBroker } from '@/domain/sci/transporter/broker/ups/ups.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import {
  defaultShipment,
  defaultShipmentWithItems,
  multiShipment,
  upsAccount,
} from '@/domain/sci/transporter/contants';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';

// 测试url
const webServiceUrl = 'https://wwwcie.ups.com/webservices';
const config: BaseConfig = {
  // 生产账号
  accountInfo: {
    number: '534F10',
    password: 'uPs-2018',
    username: '9845Y8',
    AccessLicenseNumber: '0D50DBAC070A10A8',
  },
  labelFormat: {
    value: 'png',
    labelType: 'pdf',
  },
  productCode: '11',
  shipmentUrl: `${webServiceUrl}/Ship`,
};
describe('Ups Client', () => {
  const client = new UpsBroker();
  const transporter = 'UPS';

  it('sec-create parcel', async () => {
    defaultShipment.parcels = [
      {
        weight: 1,
        reference: 'reference1',
        insuranceValue: 0,
        items: [
          {
            value: 1,
            description: 'book',
            quantity: 1,
            weight: 1,
            hsCode: 123456,
          },
        ],
      },
      {
        weight: 2,
        reference: 'reference2',
        insuranceValue: 0,
        items: [
          {
            value: 1,
            description: 'book',
            quantity: 1,
            weight: 1,
            hsCode: 123456,
          },
          {
            value: 1,
            description: 'shoes',
            quantity: 1,
            weight: 1,
            hsCode: 123456,
          },
        ],
      },
    ];
    defaultShipment.parcel = null;
    const result = await client.create(defaultShipment, config);
    expect(result[0].label).not.toBeNull();
    await writeLabelAndLog(transporter, result[0].label);
  });

  it('should create pdf', async () => {
    config.labelFormat.labelType = 'pdf';
    const result = await client.create(defaultShipment, config);
    await writeLabelAndLog(transporter, result);
  });

  it('should create with insurance', async () => {
    config.labelFormat.labelType = 'pdf';
    defaultShipment.parcel.insuranceValue = 10;
    const result = await client.create(defaultShipment, config);
    await writeLabelAndLog(transporter, result);
  });

  it('test zpl', async () => {
    config.labelFormat.labelType = 'zpl';
    config.labelFormat.value = 'ZPL';
    const result = await client.create(defaultShipment, config);
    await writeLabelAndLog(transporter, result);
  });

  it('should create multi-parcels', async () => {
    const results = await client.create(multiShipment, config);
    for (const result of results) {
      await writeLabelAndLog(transporter, result);
    }
    expect(results).toHaveLength(2);
  });

  //TODO 等待lingbo确认
  it('multi-parcels with insurance', async () => {
    multiShipment.parcels[0].insuranceValue = 5;
    multiShipment.parcels[1].insuranceValue = 15;
    const results = await client.create(multiShipment, config);
    for (const result of results) {
      await writeLabelAndLog(transporter, result);
    }
    expect(results).toHaveLength(2);
  });

  it('should create multi-parcels format pdf', async () => {
    const results = await client.create(multiShipment, config);
    for (const result of results) {
      await writeLabelAndLog(transporter, result);
    }
    expect(results).toHaveLength(2);
  });
  it('should ups express saver', async () => {
    config.productCode = '65';
    const result = await client.create(defaultShipment, config);
    await writeLabelAndLog(transporter, result);
  });
  it.skip('should return parcel', async () => {
    const result = await client.create(defaultShipment, config);
    await writeLabelAndLog(transporter, result);
  });

  it('should with cn23', async () => {
    const result = await client.create(defaultShipmentWithItems, config);
    await writeLabelAndLog(transporter, result);
  });
});

describe('cancel shipment', () => {
  let client;
  let app: INestApplication;

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
    client = await module.resolve(UpsBroker);
  });

  it('success', async () => {
    const shipment = {
      shippingNumber: '1Z534F106835585125',
      trackingNumbers: ['1Z534F106822017334'],
    };

    const res = await client.cancelShipment(shipment, { accountInfo: upsAccount, webServiceUrl });
    expect(res).toEqual('Success');
  });
});
