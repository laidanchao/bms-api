import { StoBroker } from '@/domain/sci/transporter/broker/sto/sto.broker';

describe('STO client test', () => {
  it('sec-create parcel', async () => {
    const shipmentDto: any = {
      senderAddress: {
        province: 'Paris',
        city: 'Paris 15e',
        comment: '',
        company: '',
        countryCode: 'FR',
        email: '',
        firstName: '',
        lastName: '法国巴黎寄件',
        mobileNumber: '0989898883',
        phoneNumber: '0989898883',
        postalCode: '75015',
        street1: '8 rue henri duchene',
        street2: '',
        street3: '',
        EORI: null,
      },
      receiverAddress: {
        province: '浙江省',
        city: '杭州市',
        comment: '',
        company: '',
        countryCode: 'CN',
        email: '',
        firstName: '',
        lastName: '丰云浩',
        mobileNumber: '15767890456',
        phoneNumber: '15767890456',
        postalCode: '310000',
        street1: '滨江区 中国收件',
        street2: '',
        street3: '',
      },
      labelFormat: '100x150',
      parcel: {
        reference: 'FTL00780466FRD1',
        weight: 4,
        items: [
          {
            originCountry: 'FR',
            description: 'babybio PRIMEA',
            quantity: 2,
            weight: 0.8,
            value: 15.5,
            hsCode: '0402291100',
          },
        ],
      },
      options: {
        shipperCode: 'CDG02A',
        operator: '90088669',
        customerBatch: 'CDG0002PEK',
      },
      code: 'SF_EXP_TEST',
      platform: 'FTL-EXPRESS',
    };
    const channelConfig: any = {
      // 物流产品代码（测试产品：LTCNS）
      productCode: 'LTCNS',
      // API账号（测试账号：TESTC78C-7923-404C-82CF-CD881539123C）
      accountInfo: {
        appToken: 'TESTC78C-7923-404C-82CF-CD881539123C',
      },
      shipmentUrl: 'http://ldp.uat.stosolution.com/api/service/entrance',
    };

    const client = new StoBroker();
    const result = await client.create(shipmentDto, channelConfig);
    console.log(result);
  });

  it('fetch tracking official', async () => {
    const client = new StoBroker();
    const trackingArray = await client.fetchTrackingOfficial({
      trackingNumberArray: ['5530139508750'],
      accountInfo: { appToken: 'TESTC78C-7923-404C-82CF-CD881539123C' },
      webServiceUrl: 'http://ldp.uat.stosolution.com/api/service/entrance',
    });
    console.log(trackingArray);
  });
});
