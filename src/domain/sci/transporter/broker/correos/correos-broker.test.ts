import { CorreosBroker } from '@/domain/sci/transporter/broker/correos/correos.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const shipmentDto: any = {
  senderAddress: {
    lastName: 'LIU YU XIANG',
    phoneNumber: '34915963183',
    street1: 'Camino Hormigueras 169',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
    postalCode: '28031',
    city: 'Madrid',
    countryCode: 'ES',
    // company: 'ocean company',
  },
  receiverAddress: {
    city: 'hangzhou',
    comment: '',
    company: 'X sociale',
    countryCode: 'CN',
    email: 'ddd@ggla.com',
    firstName: 'ZHANG YING',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '310000',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  labelFormat: 'A4_PDF',
  parcel: {
    reference: 'ref 852642',
    weight: 2,
    length: 10,
    width: 15,
    height: 10,
    items: [
      {
        description: '393',
        quantity: 1,
        weight: 0.5,
        value: 1,
        originCountry: 'CN',
      },
      {
        description: '393',
        quantity: 1,
        weight: 1.5,
        value: 1,
        originCountry: 'CN',
      },
      // {
      //   description: '393',
      //   quantity: 2,
      //   weight: 0.6,
      //   value: 1,
      //   originCountry: 'CN',
      // },
      // {
      //   description: '393',
      //   quantity: 1,
      //   weight: 0.66,
      //   value: 1,
      //   originCountry: 'CN',
      // },
    ],
  },
  code: 'COR_EXPS_EU',
  platform: 'FTL-EXPRESS',
  options: {
    tipoEnvio: 4,
    needCN23: true,
  },
};

const config: BaseConfig = {
  // 生产账号
  accountInfo: {
    username: 'w81160353',
    password: 'iiMwt7Fn',
    labeler: '6SE5',
  },
  // shipmentUrl: 'https://preregistroenviospre.correos.es/preregistroenvios', // 测试请求链接
  shipmentUrl: 'https://preregistroenvios.correos.es/preregistroenvios', // 测试环境无法使用，改用正式环境, 测试下单
  labelFormat: {
    code: 'A4_PDF',
    value: 'pdf',
    labelType: 'pdf',
  },
  productCode: 'S0410',
};

describe('create()', () => {
  const client = new CorreosBroker(null);
  const transporter = 'Correos';

  it('sec-create parcel', async () => {
    const result = await client.create(shipmentDto, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('should fetchTrackingUnofficial', async function() {
    const result = await client.fetchTrackingUnofficial({ trackingNumberArray: ['PQ5FY40711346130128042V'] });
    expect(result[0].trackingNumber).toEqual('PQ5FY40711346130128042V');
    const parcel = {
      status: 'CREATED',
    };
    const newParcel = await client.handleTracking(parcel, result);
    expect(newParcel.status).toEqual('CREATED');
  });
});
