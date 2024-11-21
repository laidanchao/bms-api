import { DhlBroker } from '@/domain/sci/transporter/broker/dhl/dhl.broker';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { LogoImageFormat } from '@/domain/sci/transporter/broker/dhl/dhl.constrant';

const shipmentDto: any = {
  senderAddress: {
    province: 'Paris(75)',
    city: 'Paris 11e',
    comment: '',
    company: 'test qi ye',
    countryCode: 'FR',
    email: '',
    firstName: 'fa guo ji jian',
    lastName: '',
    mobileNumber: '0654215852',
    phoneNumber: '0654215852',
    postalCode: '75011',
    street1: 'fa guo ji jian xiang xi di zhi',
    street2: '',
    street3: '',
    EORI: '1212',
  },
  receiverAddress: {
    province: 'zhe jiang sheng',
    city: 'hang zhou shi',
    comment: '',
    company: 'feng yun hao',
    countryCode: 'CN',
    email: '',
    firstName: 'feng yun hao',
    lastName: '',
    mobileNumber: '15757993046',
    phoneNumber: '15757993046',
    postalCode: '310000',
    street1: 'zhong guo shou jian xiang xi di zhi',
    street2: '',
    street3: '',
  },
  labelFormat: 'A6_PDF',
  parcel: {
    reference: '00829672',
    weight: 3,
    items: [
      {
        originCountry: 'FR',
        description: 'Instrument',
        quantity: 1,
        weight: 3,
        value: 12,
        hsCode: '9207909000',
      },
    ],
    insuranceValue: 0,
  },
  shippingDate: '2021-11-27T13:29:34+02:00',
  description: 'Instrument',
  options: {
    invoiceDate: '2021-10-25',
    shippingPaymentType: 'S',
    customsInvoiceType: 'PROFORMA_INVOICE',
    paymentInfo: 'DAP',
    whetherCustomsClearance: true,
    insuranceValue: 0,
    invoiceNumber: '00829672',
    requireDHLCustomsInvoice: true,
    specialServices: ['PAPERLESS_TRADE_SERVICE'],
    shipperRegistrationNumbers: [],
    customLogo: {
      logoImage: '',
      logoImageFormat: LogoImageFormat.PNG,
    },
  },
  code: 'EXP_DHLO_DOX',
  platform: 'FTL-EXPRESS',
};

describe('dhl client test', () => {
  it('should auth exception', async function() {
    const channelConfig: any = {
      // accountInfo: { password: 'R!7bW@5kV#2p', username: 'usaFR', shipperAccountNumber: '220424192' },
      accountInfo: {
        username: 'esendeoFR',
        password: 'N$8nL!3tG#6b 987',
        shipperAccountNumber: 220370316,
      },
      labelFormat: {
        type: 'PDF',
        value: 'ECOM26_64_002',
      },
      productCode: 'P',
      // 测试地址
      shipmentUrl: 'https://wsbexpress.dhl.com/sndpt/expressRateBook',
      // shipmentUrl: 'https://wsbexpress.dhl.com/gbl/expressRateBook',
    };
    const dhlClient = new DhlBroker();
    try {
      await dhlClient.create(shipmentDto, channelConfig);
    } catch (e) {
      expect(e.message).toEqual(
        'DHL: <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">\r\n' +
          '   <env:Header></env:Header>\r\n' +
          '   <env:Body>\r\n' +
          '      <env:Fault>\r\n' +
          '         <faultcode>env:Server</faultcode>\r\n' +
          '         <faultstring></faultstring>\r\n' +
          '         <detail fault:type="Unauthorized" xmlns:fault="http://www.dhl.com/soapfaults"></detail>\r\n' +
          '      </env:Fault>\r\n' +
          '   </env:Body>\r\n' +
          '</env:Envelope>',
      );
    }
  });

  it('sec-create parcel', async () => {
    const channelConfig: any = {
      accountInfo: { password: 'R!7bW@5kV#2p', username: 'usaFR', shipperAccountNumber: '220424192' },
      // accountInfo: {
      //   username: 'esendeoFR',
      //   password: 'N$8nL!3tG#6b',
      //   shipperAccountNumber: 220370316,
      // },
      labelFormat: {
        type: 'PDF',
        value: 'ECOM26_64_002',
      },
      productCode: '8',
      // 测试地址
      shipmentUrl: 'https://wsbexpress.dhl.com/sndpt/expressRateBook',
      // shipmentUrl: 'https://wsbexpress.dhl.com/gbl/expressRateBook',
    };
    const dhlClient = new DhlBroker();
    const result = await dhlClient.create(shipmentDto, channelConfig);
    expect(result[0].label).not.toBeNull();
    await writeLabelAndLog('DHL', result[0]);
  });

  it('getAvailableProductsWithShippingPrice', async function() {
    const channelConfig: any = {
      accountInfo: { password: 'R!7bW@5kV#2p', username: 'usaFR', shipperAccountNumber: '220424192' },
      // accountInfo: {
      //   username: 'esendeoFR',
      //   password: 'N$8nL!3tG#6b',
      //   shipperAccountNumber: 220370316,
      // },
      labelFormat: {
        type: 'PDF',
        value: 'ECOM26_64_002',
      },
      productCode: '8',
      // 测试地址
      shipmentUrl: 'https://wsbexpress.dhl.com/gbl/expressRateBook',
      // shipmentUrl: 'https://wsbexpress.dhl.com/gbl/expressRateBook',
    };
    const dhlClient = new DhlBroker();
    const result = await dhlClient.getShipmentRate(shipmentDto, channelConfig);
    expect(result).toMatchObject({});
  });

  it('dev tracking', async () => {
    const result = await new DhlBroker().fetchTrackingOfficial({
      trackingNumberArray: ['JD0002235001381021', 'JD014600007815135531'],
      // trackingNumberArray: ['JD014600009111046917', 'JD014600009111046916'],
      accountInfo: {
        username: 'usaFR',
        password: 'R!7bW@5kV#2p',
      },
    });
    console.log(result);
  });

  it('prod tracking', async () => {
    const result = await new DhlBroker().fetchTrackingOfficial({
      trackingNumberArray: ['8193385863', 'JD014600009398190229'],
      accountInfo: {
        username: 'usaFR',
        password: 'R!7bW@5kV#2p',
      },
    });
    console.log(result);
  });
});
