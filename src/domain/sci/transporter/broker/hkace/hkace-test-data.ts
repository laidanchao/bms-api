import crypto from 'crypto';
import qs from 'qs';
// 模拟平台请求：使用client进行测试
const basicConfig = {
  shipmentUrl: 'http://ard.rtb56.com/webservice/PublicService.asmx/ServiceInterfaceUTF8',
  productCode: 'COLISSIMO',
  accountInfo: {
    appToken: '5ced00d8b3c42c075955759a7f24dcae',
    appKey: '17fbf8027c3043e176052e8bf1d93c5517fbf8027c3043e176052e8bf1d93c55\t',
  },
  labelFormat: {
    labelType: 'pdf',
    value: 'THE',
  },
  platform: 'FTL-OMS',
};
const testSenderAddresses = [
  {
    company: 'Cindy H',
    street1: 'bin jiang da dao',
    countryCode: 'CN',
    city: 'hang zhou',
    province: 'zhe jiang',
    postalCode: '310051',
    phoneNumber: '0148340955',
    email: '897491149@qq.com',
    lastName: 'xiong',
    firstName: 'min',
  },
];
const testReceiverAddresses = {
  FR: {
    firstName: 'yangyang',
    lastName: 'xiao',
    company: 'TEST COMPANY',
    email: 'xiaoyangyang@ftl-express.com',
    phoneNumber: '0627956169',
    mobileNumber: '0627956169',
    street1: '51 AVENUE DE LA PAIX',
    city: 'paris',
    postalCode: '75010',
    countryCode: 'FR',
    comment: '',
  },
  NL: {
    firstName: 'Roliene',
    lastName: 'ZAMAN',
    company: 'TEST COMPANY',
    email: 'roliene@zaman.nl',
    phoneNumber: '0031651117192',
    mobileNumber: '0114314837',
    street1: 'absdaalseweg 12',
    city: 'Hulst',
    postalCode: '4561GG',
    countryCode: 'NL',
    comment: '',
  },
  BE: {
    firstName: 'Roliene',
    lastName: 'ZAMAN',
    company: 'TEST COMPANY',
    email: 'yangyang@uuxuu.com',
    phoneNumber: '0032496221674',
    mobileNumber: '',
    street1: '54 RUE DE LA VENERIE',
    city: 'Turnhout',
    postalCode: '2300',
    countryCode: 'BE',
    comment: '',
  },
  DE: {
    firstName: 'Roliene',
    lastName: 'ZAMAN',
    company: 'TEST COMPANY',
    email: 'xiaoyangyang@ftl-express.com',
    phoneNumber: '01718079019',
    mobileNumber: '01718079019',
    street1: '18 Niemegker Straße',
    city: 'Berlin',
    postalCode: '12689',
    countryCode: 'DE',
    comment: '',
  },
  ES: {
    firstName: 'Roliene',
    lastName: 'ZAMAN',
    company: 'TEST COMPANY',
    email: 'xiaoyangyang@ftl-express.com',
    phoneNumber: '0034637765778',
    mobileNumber: '0034637765778',
    street1: 'CALLE SOMBRERERIA N27',
    city: 'Burgos',
    postalCode: '09002',
    countryCode: 'ES',
    comment: '',
  },
  IT: {
    firstName: 'Roliene',
    lastName: 'ZAMAN',
    company: 'TEST COMPANY',
    email: 'xiaoyangyang@ftl-express.com',
    phoneNumber: '+37064694219',
    mobileNumber: '',
    street1: 'KURSIU G.7 (LAGAMINAIVISIEMS)',
    city: 'Kaunas',
    postalCode: '51267',
    countryCode: 'IT',
    comment: '',
  },
  // DK: {
  //   firstName: 'Roliene',
  //   lastName: 'ZAMAN',
  //   company: 'TEST COMPANY',
  //   email: 'roliene@zaman.nl',
  //   phoneNumber: '4530473070',
  //   mobileNumber: '0114314837',
  //   street1: 'bjodstrupvej 8',
  //   city: 'hojbjerg',
  //   postalCode: '8270',
  //   countryCode: 'DK',
  //   comment: '',
  // },
};
const testParcel = {
  weight: 1.8,
  // reference: 'Test parcel',
  length: 10,
  height: '20',
  width: '20',
  items: [
    {
      description: 'switch',
      quantity: 1,
      weight: 150,
      value: 10,
      originCountry: 'CN',
      hsCode: '123456',
    },
    {
      description: 'ps5',
      quantity: 2,
      weight: 2.3,
      value: 20,
      originCountry: 'CN',
      hsCode: '123456',
    },
  ],
};
const buildShipment = countryCode => {
  return {
    parcel: testParcel,
    senderAddress: testSenderAddresses[0],
    receiverAddress: testReceiverAddresses[countryCode],
    transporter: 'CAINIAO',
    labelFormat: 'PDF_A4_300dpi',
  };
};
// // 原始请求集合
// const requestOptionBuild = (msg_type, logistics_interface) => {
//   const body = {
//     logistic_provider_id: basicConfig.accountInfo.logistic_provider_id,
//     to_code: 'CNG_EU',
//     msg_type,
//     logistics_interface: JSON.stringify(logistics_interface),
//   };
//
//   const str = body.logistics_interface + basicConfig.accountInfo.token;
//   body['data_digest'] = crypto
//     .createHash('md5')
//     .update(str)
//     .digest('base64');
//   return {
//     url: basicConfig.shipmentUrl,
//     method: 'POST',
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     data: qs.stringify(body),
//   };
// };
// // 原始下单请求测试集
// const orderBody = {
//   syncGetAwb: 'true',
//   outOrderId: `ESD_${new Date().getTime().toString()}999`,
//   solutionParam: { solutionCode: 'EU_PARCEL_LOCAL_OPEN' },
//   cainiaoIdentity: basicConfig.accountInfo.cainiaoIdentity,
//   opRequirements: { expectedDeliveryTime: '9:00 AM to 1:00 PM' },
//   packageParams: [
//     {
//       packageValue: { amount: '123', currency: 'MYR' },
//       dimWeight: { length: '12', width: '21', dimensionUnit: 'cm', weight: '1120', weightUnit: 'g', height: '21' },
//       itemParams: [{ unitPrice: '12', unitPriceCurrency: 'MYR', quantity: '1', secondaryName: 'apple', name: '苹果' }],
//     },
//   ],
//   senderParam: {
//     address: {
//       zipcode: '77090',
//       country: 'FR',
//       province: 'Collégien',
//       city: 'Collégien',
//       street: 'Z.A.E des portes de la Forêt',
//       exAddressID: '1',
//       addressType: 'portes',
//       district: 'portes',
//       addressLine1: '1',
//       addressLine2: 'portes',
//       addressID: '1',
//     },
//     mobilePhone: '0114314837',
//     name: 'Roliene ZAMAN',
//     telephone: '0031651117192',
//     email: 'roliene@zaman.ccc',
//   },
//   receiverParam: {
//     address: {
//       zipcode: '4561GG',
//       country: 'NL',
//       province: 'Hulst',
//       city: 'Hulst',
//       street: 'absdaalseweg 12',
//       exAddressID: '1',
//       addressType: 'portes',
//       district: 'portes',
//       addressLine1: '1',
//       addressLine2: 'portes',
//       addressID: '1',
//     },
//     mobilePhone: '0114314837',
//     name: 'Roliene ZAMAN',
//     telephone: '0031651117192',
//     email: 'roliene@zaman.nl',
//   },
//   returnerParam: {
//     address: {
//       zipcode: '77090',
//       country: 'FR',
//       province: 'Collégien',
//       city: 'Collégien',
//       street: 'Z.A.E des portes de la Forêt',
//       exAddressID: '1',
//       addressType: 'portes',
//       district: 'portes',
//       addressLine1: '1',
//       addressLine2: 'portes',
//       addressID: '1',
//     },
//     mobilePhone: '0114314837',
//     name: 'Roliene ZAMAN',
//     telephone: '0031651117192',
//     email: 'roliene@zaman.ccc',
//   },
// };
// const orderParams = requestOptionBuild('CN_OVERSEA_DL_CREATE_PACKAGE', orderBody);
// // 原始面单请求测试集
// const traceBody = {
//   logisticOrderCode: 'LP00579396348112',
//   clientOrderId: '16855843518309999',
// };
// const traceParams = requestOptionBuild('CN_OVERSEA_DL_GET_WAYBILL', traceBody);
export { basicConfig, buildShipment };
