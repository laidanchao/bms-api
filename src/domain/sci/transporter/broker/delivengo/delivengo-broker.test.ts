import { DelivengoBroker } from '@/domain/sci/transporter/broker/delivengo/delivengo.broker';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config = {
  // 测试生产配置相同
  productCode: 33,
  accountInfo: { apiToken: 'Vi7hai7jie9aideiv4loo1aushaeboh3' },
  labelFormat: {
    value: 32,
    labelType: 'application/pdf',
  },
  shipmentUrl: 'https://mydelivengo.laposte.fr/api/v2.4', // 生产请求URL
};

const shipmentDto: any = {
  senderAddress: {
    province: 'Paris(75)',
    city: 'Paris 15e',
    countryCode: 'FR',
    postalCode: '75015',
    comment: 'comment',
    company: 'company',
    email: 'email',
    firstName: 'name1',
    lastName: 'name2',
    mobileNumber: 'mobileNumber',
    phoneNumber: 'phoneNumber',
    street1: 'street1',
    street2: 'street2',
    street3: 'street3',
    EORI: '3234',
  },
  receiverAddress: {
    province: 'si chuan sheng',
    city: 'cheng du shi',
    countryCode: 'CN',
    postalCode: '610200',
    comment: 'comment',
    company: 'company',
    email: '897491140@qq.com',
    firstName: 'name1',
    lastName: 'name2',
    mobileNumber: 'mobileNumber',
    phoneNumber: 'phoneNumber',
    street1: 'street1',
    street2: 'street2',
    street3: 'street3',
  },
  labelFormat: 'A4_PDF',
  parcel: {
    reference: 'FTL00795796FR',
    weight: 1.8, // delivengo 不能超过2kg
    items: [
      {
        originCountry: 'FR',
        description: 'EL RENGADO TEMPRANILLO',
        quantity: 2,
        weight: 0.3,
        value: 1.5,
        hsCode: '2204214210',
      },
      {
        originCountry: 'FR',
        description: 'EL RENGADO TEMPRANILLO',
        quantity: 2,
        weight: 0.5,
        value: 0.5,
        hsCode: '2204214210',
      },
    ],
  },
  options: {
    deliveryFee: 1,
    customsCategory: 1,
  },
  code: 'DG_EXPRESS_SUIVI',
  platform: 'FTL-EXPRESS',
};

describe('Delivengo Client', () => {
  const client = new DelivengoBroker();
  const transporter = 'Delivengo';

  it('sec-create parcel', async () => {
    const result = await client.create(shipmentDto, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  // TODO keminfeng, huangjiangyan 完成Delivengo(AsendiaFR)包裹轨迹的跟踪
  //  以"LD106465787FR" 跟踪单号为例 在lapost官网可查询 https://www.laposte.fr/outils/suivre-vos-envois?code=LD106465787FR
  //  其他单号的例子有:
  //  LD107122823FR
  //  LD107092596FR
  //  LD107031889FR
  //  LD107031685FR
  //  LD106983716FR
  it('fetchTrackingUnofficial', async () => {
    const trackingNumberArray = ['LD108546965FR'];
    const tracking = await client.fetchTrackingUnofficial({ trackingNumberArray });
    expect(tracking).toBeNull();
  });
});

// const mockResponse = {
//   data: {
//     id: 15361226,
//     plis: [
//       {
//         id: '30552460',
//         numero: 'UD031536258FR',
//       },
//     ],
//     documents_supports: '',
//     documents_douaniers: null,
//     factures: null,
//   },
// };
