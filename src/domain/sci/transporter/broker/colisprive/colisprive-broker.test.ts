import { ColispriveBroker } from '@/domain/sci/transporter/broker/colisprive/colisprive.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config: BaseConfig = {
  // 生产账号 因为对方测试环境不可达
  // accountInfo: {
  //   password: 'p!@FRaeDrUk!*gTf',
  //   username: 'FTLEXPRESSWS',
  //   AccountID: 'EM180619',
  //   CPCustoID: 'D0',
  // },
  accountInfo: {
    password: 'MonMotDePasse',
    username: 'MONLOGIN',
    AccountID: 'EM071119',
    CPCustoID: '27',
    contractNumber: '818301',
  },
  // shipmentUrl: 'https://www.colisprive.com/Externe/WSCP.asmx',
  shipmentUrl: 'https://test.colisprive.com/Externe/WSCP.asmx',
  labelFormat: {
    value: 'PDF_ZEBRA',
    labelType: 'pdf',
  },
  ftlRoute: 'CP_FR_CSORT',
};

const shipment = {
  senderAddress: {
    city: 'paris',
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  receiverAddress: {
    city: 'paris',
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75013',
    street1: 'receiver street address 1 ds',
    street2: 'receiver street address 2 ds',
    street3: 'receiver street address 3 ds',
  },
  parcel: {
    reference: 'ref123456',
    weight: 1,
    items: [
      {
        originCountry: 'CN',
        description: 'GALLIA BEBE EXPERT HA 2 800G',
        quantity: 1,
        weight: 1,
        value: 16,
        hsCode: '0402291100',
      },
    ],
  },
};

describe('Colisprive Client', () => {
  let client;
  let app: INestApplication;
  const transporter = 'Colisprive';

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
    client = await module.resolve(ColispriveBroker);
  });

  it('create parcel', async () => {
    const result = await client.create(shipment, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  /*
  it('should upload s3', async () => {
    const config: ChannelConfig ={
      accountInfo: _.find(account, {transporter: 'COLISPRIVE', route: 'CP_FR_CSORT'})['accountInfo'],
      shipmentUrl: "https://www.test.colisprive.com/Externe/WSCP.asmx",
      labelFormat: 'pdf',
      route: 'CP_FR_CSORT'
    }
    const result = await createByClient(defaultShipment, config);
    expect(result.label).toBeUndefined();
  });
*/
  // it('should fail cause zipcode not access', async () => {
  //   const config: BaseConfig = {
  //     accountInfo: _.find(account, { transporter: 'COLISPRIVE', route: 'CP_FR' })['accountInfo'],
  //     shipmentUrl: 'https://www.test.colisprive.com/Externe/WSCP.asmx',
  //     labelFormat: 'pdf',
  //     route: 'CP_FR',
  //   };
  //   try {
  //     await client.create(defaultShipment, config);
  //   } catch (e) {
  //     expect(e.message).toEqual('ColisPrive不支持该邮编: 75008');
  //   }
  // });

  /*
  it('check duplicate tracking number', async () => {
    const config: ChannelConfig = {
      accountInfo: _.find(account, { transporter: 'COLISPRIVE', route: 'CP_FR' })['accountInfo'],
      shipmentUrl: "https://www.test.colisprive.com/Externe/WSCP.asmx",
      labelFormat: 'pdf',
      route: 'CP_FR'
    }
    try {
      await createByClient(defaultShipment, config);
    }catch (e) {
      expect(e.message).toEqual('ColisPrive: BadRequest: 客户号reference223已经关联运单号27990128827775013');
    }
  });
 */
});
