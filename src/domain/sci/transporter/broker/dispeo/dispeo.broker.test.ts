import axios from 'axios';
import { CainiaoBroker } from '@/domain/sci/transporter/broker/cainiao/cainiao.broker';
import { buildShipment, orderParams, traceParams } from '@/domain/sci/transporter/broker/cainiao/cainiao-test-data';
import { DispeoBroker } from '@/domain/sci/transporter/broker/dispeo/dispeo.broker';
import { _getTrackingNumber } from '@/domain/job/sct/policy/dispeo-tracking-policy';
const shipmentObj = {
  shippingDate: '2024-09-02T06:26:19.867Z',
  options: {
    enableCustomLogo: false,
    specialServices: [],
    totalAmount: 1,
    invoiceWay: 'LAST',
  },
  labelFormat: 'A6_PDF',
  senderAddress: {
    vatNumber: '22',
    EORI: 'FR2',
    IOSS: null,
    firstName: 'Tom',
    lastName: 'Tom',
    company: 'Jerry',
    shopName: 'Jerry',
    email: 'babyviegas@yahoo.com',
    type: 'sender',
    phoneNumber: '0612626743',
    mobileNumber: null,
    complement: null,
    countryCode: 'FR',
    city: 'Lyon',
    postalCode: '69003',
    center: null,
    comment: '',
    province: null,
    street1: '136 Rue Ferdinand Buisson',
    street2: '',
    street3: '',
  },
  receiverAddress: {
    vatNumber: 'gssh',
    EORI: '',
    IOSS: null,
    firstName: 'Sidfqduzg fdee TEST',
    lastName: 'Zesoah',
    company: 'Beta',
    shopName: 'Beta',
    email: 'test@gmail.com',
    type: 'receiver',
    phoneNumber: '0789365401',
    mobileNumber: '0789365401',
    complement: '',
    countryCode: 'FR',
    city: 'Paris',
    postalCode: '75012',
    center: null,
    comment: '',
    province: null,
    street1: '14 rue taine',
    street2: '',
    street3: '',
  },
  clientId: '2243',
  platform: 'ESENDEO',
  code: 'DIS_ESD_DASF',
  parcel: {
    insuranceValue: 0,
    options: {
      customsCategory: 6,
      sendingReasonCode: 2,
      sendingReason: 'Sale of merchandise',
    },
    weight: 3.39,
    reference: 'LZL_T6JmIGE_refer',
    length: 32,
    width: 23,
    height: 23,
  },
};
const basicConfig = {
  shipmentUrl: 'https://ws-tms-ext-rec.dispeo.com/ws-editique-public/api/Shipping/CreateShipment',
  productCode: 'COLISSIMO_DOMICILE_AVEC_SIGNATURE_FRANCE',
  accountInfo: {
    token: '478E9694AD16C1729D1E73C536D790FC',
  },
  labelFormat: {
    labelType: 'zpl',
    value: 'zpl_203',
    code: 'A6_PDF',
  },
};
// 下单_测试请求
it('BY_CLIENT_CN_OVERSEA_DL_CREATE_PACKAGE', async () => {
  const client = new CainiaoBroker();
  const shipment = buildShipment('FR') as any;
  const channelConfig = basicConfig;
  const result = await client.create(shipment, channelConfig);
  expect(result).not.toBeNull();
});

// 下单_原始测试请求
it('ORIGINAL_CN_OVERSEA_DL_CREATE_PACKAGE', async () => {
  const { data } = await axios.request(orderParams as any);
  expect(data).not.toBeNull();
});

// 面单获取_原始测试请求
it('ORIGINAL_CN_OVERSEA_DL_GET_LABEL', async () => {
  const { data } = await axios.request(traceParams as any);
  expect(data).not.toBeNull();
});

it('Dispeo_Label_A6', async () => {
  const client = new DispeoBroker();
  const shipment = shipmentObj as any;
  shipment.transporter = 'DISPEO';
  shipment.labelFormat = 'A6_PDF';
  const channelConfig = basicConfig;
  const result = await client.create(shipment, channelConfig);
  expect(result).not.toBeNull();
});

it('sftp Dispeo', async () => {
  const trackingNumbers = [
    '6A7657061874',
    '6A7658661655',
    '6A7657059027',
    '6A7659138365',
    '6A7657703966',
    '6A7658194533',
    '6A7657383539',
    '6A7657058789',
    '6A7657060276',
    '6A7657380327',
    '6A7659140268',
    '6A7632118267',
    '6A7631319149',
    '6A7461358227',
    '6A7461392859',
    '6A7461393235',
    '6A7461393254',
  ];
  const result = trackingNumbers.map(v => {
    return _getTrackingNumber(v);
  });
  console.log(result);
  expect(result).not.toBeNull();
});
