// import * as fs from 'fs';
// import * as crypto from 'crypto';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
// import { XMLParser } from '@/modules/channel/transporter/client/sf/XmlParser';
import { SfBroker } from '@/domain/sci/transporter/broker/sf/sf.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config: BaseConfig = {
  // 测试账号
  accountInfo: {
    custId: '0010002117',
    checkWord: 'fc34c561a34f',
    customerCode: 'OSMS_1',
  },
  labelFormat: {
    value: 'A4',
    labelType: 'pdf',
  },
  productCode: '101',
  shipmentUrl: 'http://osms.sit.sf-express.com:2080/osms/services/OrderWebService',
};

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
    lastName: '谢文真',
    mobileNumber: '15767890456',
    phoneNumber: '15767890456',
    postalCode: '310000',
    street1: '滨江区 中国收件',
    street2: '',
    street3: '',
  },
  labelFormat: '100x150',
  parcel: {
    reference: 'FTL00780466WZ004',
    weight: 3,
    items: [
      {
        originCountry: 'FR',
        description: 'babybio PRIMEA',
        quantity: 2,
        weight: 0.8,
        value: 10,
        hsCode: '0402291100',
      },
    ],
  },
  options: {
    shipperCode: 'CDG02A',
    operator: '90088669',
    customerBatch: 'CDG0002PEK',
    isChangeOrder: '1',
  },
  code: 'SF_EXP_TEST',
  platform: 'FTL-EXPRESS',
};

describe('SfClient test', function() {
  const client = new SfBroker();
  const transporter = 'Sf';

  it('should create label success', async function() {
    const result: any = await client.create(shipmentDto, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('should search matched result', async function() {
    config.accountInfo = { custId: '0330000053', checkWord: '7aa26cbf1de74783', customerCode: 'OSMS_3594' };
    config.shipmentUrl = 'https://osms.sf-express.com/osms/services/OrderWebService';
    const result: any = await client.searchShipmentInfo('FTL00826178FR', config);
    expect(result).toMatchObject({
      orderid: 'FTL00826178FR',
      mailNo: 'SF1317293150325',
      origincode: 'CDG02A',
      destcode: '523',
      printUrl: 'https://osms.sf-express.com/osms/wbs/print/printOrder.pub?mailno=P9TLG+KOconiBD7xKL6mTA==',
      invoiceUrl: 'https://osms.sf-express.com/osms/wbs/print/printInvoice.pub?mailno=P9TLG+KOconiBD7xKL6mTA==',
    });
  });

  // it('create', async function() {
  //   // const url = 'http://osms.sit.sf-express.com:2080/osms/services/OrderWebService';
  //   const customerCode = 'OSMS_897';
  //   const checkWord = '43fbbe7bea7241df';
  //   const xmlString = await fs.readFileSync(`${__dirname}/SfShipping.xml`).toString();
  //   const data = Buffer.from(xmlString).toString('base64');
  //   const md5 = crypto
  //     .createHash('md5')
  //     .update(xmlString + checkWord)
  //     .digest('hex');
  //   const validateStr = Buffer.from(md5).toString('base64');
  //
  //   const labelConfig = {
  //     wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
  //     url: 'http://osms.sf-express.com/osms/services/OrderWebService',
  //   };
  //   const client: any = await new Soap().createClient(labelConfig);
  //   const body = {
  //     // xml 的string转的 base64
  //     data,
  //     // xml 的string + checkWord 计算md5后 转base64
  //     validateStr,
  //     customerCode,
  //   };
  //   // const responses = await client['sfexpressServiceAsync'](body);
  //   const responses: any = [
  //     {
  //       Return:
  //         '<Response service="OrderWebService"><Head>OK</Head><Body><OrderResponse><customerOrderNo>201602250001</customerOrderNo><mailNo>SF1303275921011</mailNo><originCode>JFK</originCode><destCode>755</destCode><printUrl>http://osms.sf-express.com/osms/wbs/print/printOrder.pub?mailno=gJqPWLwNHO0FmxqYokowUw==</printUrl><invoiceUrl>http://osms.sf-express.com/osms/wbs/print/printInvoice.pub?mailno=gJqPWLwNHO0FmxqYokowUw==</invoiceUrl></OrderResponse></Body></Response>',
  //     },
  //     '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ns2:sfexpressServiceResponse xmlns:ns2="http://impl.server.order.services.wbs.osms.sf.com/"><Return>&lt;Response service="OrderWebService"&gt;&lt;Head&gt;OK&lt;/Head&gt;&lt;Body&gt;&lt;OrderResponse&gt;&lt;customerOrderNo&gt;201602250001&lt;/customerOrderNo&gt;&lt;mailNo&gt;SF1303275921011&lt;/mailNo&gt;&lt;originCode&gt;JFK&lt;/originCode&gt;&lt;destCode&gt;755&lt;/destCode&gt;&lt;printUrl&gt;http://osms.sf-express.com/osms/wbs/print/printOrder.pub?mailno=gJqPWLwNHO0FmxqYokowUw==&lt;/printUrl&gt;&lt;invoiceUrl&gt;http://osms.sf-express.com/osms/wbs/print/printInvoice.pub?mailno=gJqPWLwNHO0FmxqYokowUw==&lt;/invoiceUrl&gt;&lt;/OrderResponse&gt;&lt;/Body&gt;&lt;/Response&gt;</Return></ns2:sfexpressServiceResponse></soap:Body></soap:Envelope>',
  //     null,
  //     '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:tns="http://impl.server.order.services.wbs.osms.sf.com/"><soap:Header></soap:Header><soap:Body><tns:sfexpressService><data>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPFJlcXVlc3Qgc2VydmljZT0iUmVDb25mcmltV2VpZ2h0T3JkZXIiIGxhbmc9InpoX0NOIj4KICA8SGVhZD5PU01TXzg5NzwvSGVhZD4KICA8Qm9keT4KICAgIDxPcmRlcgogICAgICByZWZlcmVuY2Vfbm8xPSIyMDE2MDIyNTAwMDEiCiAgICAgIGV4cHJlc3NfdHlwZT0iMTAxIgogICAgICBwYXJjZWxfcXVhbnRpdHk9IjEiCiAgICAgIHBheV9tZXRob2Q9IjEiCiAgICAgIGN1cnJlbmN5PSJVU0QiCiAgICAgIGpfY29tcGFueT0iaGFmYSIKICAgICAgal9jb250YWN0PSJDdXN0b21lciBTZXJ2aWNlIgogICAgICBqX3RlbD0iOTUxNjE2ODg4OCIKICAgICAgal9hZGRyZXNzPSIyMjc4MCBIQVJMRVkgS05PWCBCTFZEIENBIFBFUlJJUyIKICAgICAgal9jb3VudHJ5PSJVUyIKICAgICAgal9wb3N0X2NvZGU9Ijk4ODg4IgogICAgICBkX2NvbXBhbnk9IuadjumhuuS4sCIKICAgICAgZF9jb250YWN0PSLmnY7pobrkuLAiCiAgICAgIG9yZGVyX2NlcnRfdHlwZT0iSUQiCiAgICAgIG9yZGVyX2NlcnRfbm89IjQzMjMwMTE5NzMwNDA2ODg4OCIKICAgICAgZF9hZGRyZXNzPSLlub/kuJwg5rex5ZyzIOWNl+WxseWMuui9r+S7tuS6p+S4muWfuuWcsELmoIsy5qW8IgogICAgICBkX3RlbD0iMTMzMTI5MDg4ODgiCiAgICAgIGRfY291bnRyeT0iQ04iCiAgICAgIGRfcG9zdF9jb2RlPSI1MTgwMDAiCiAgICAgIGN1c3RpZD0iMDY1NTAwMTkzNCIKICAgICAgdGF4X3BheV90eXBlPSIxIgogICAgICB0YXg9IkREUCIKICAgICAgcGF5bWVudF9udW1iZXI9IjQ0Nzg4ODg4ODg4ODgwMDAwMDg4OCIKICAgICAgcGF5bWVudF90aW1lPSIyMDE1LTExLTEzIDExOjA4OjE2IgogICAgICBwYXltZW50X3Rvb2w9IlZJU0EiCiAgICAgIGV4cHJlc3NfcmVhc29uPSIyIgogICAgICB0cmFkZV9jb25kaXRpb249IkNJRiIKICAgICAgaXNfY2hhbmdlX29yZGVyID0iMSI+CiAgICAgIDwhLS0g6ZmE5Yqg5pyN5YqhIC0tPgogICAgICA8QWRkZWRTZXJ2aWNlIG5hbWU9IlBLRkVFIiB2YWx1ZT0nMTInIHZhbHVlMT0iMzMiLz4KICAgICAgPCEtLSDotKfniakgLS0+CiAgICAgIDxDYXJnbwogICAgICAgIGdvb2RzX2NvZGU9IkpBTDAxMDMwIgogICAgICAgIHByb2R1Y3RfcmVjb3JkX25vPSJKQUwwMTAzMCIKICAgICAgICBuYW1lPSJKdXN0IGEgTGVhZiBvcmdhbmljIFRlYTvmnInmnLrojYnmnKzojLbvvIzoipnok4nnlJ/lp5wyIG96ICg1NiBnKSIKICAgICAgICBjb3VudD0iMSIKICAgICAgICBicmFuZD0iVklTQSIKICAgICAgICBjdXJyZW5jeT0iVVNEIgogICAgICAgIHVuaXQ9IuS7tiIKICAgICAgICBhbW91bnQ9IjUuNzAiCiAgICAgICAgb3JpZ2luPSJ1cyIKICAgICAgICBzcGVjaWZpY2F0aW9ucz0iMSIKICAgICAgICBnb29kX3ByZXBhcmRfbm89JzMzJwogICAgICAgIHNvdXJjZV9hcmVhID0gJ1VTQScvPgogICAgPC9PcmRlcj4KICA8L0JvZHk+CjwvUmVxdWVzdD4K</data><validateStr>MWM3NmRiOGI2OTE3ZGViZDhlYTgwZDg5ZDMxN2E0ZTI=</validateStr><customerCode>OSMS_897</customerCode></tns:sfexpressService></soap:Body></soap:Envelope>',
  //   ];
  //   const res = new XMLParser().parseXmlString2Obj(responses[0].Return);
  // });

  it('should create success', async function() {
    const body = {
      data:
        'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPFJlcXVlc3Qgc2VydmljZT0iUmVDb25mcmltV2VpZ2h0T3JkZXIiIGxhbmc9InpoX0NOIj4KICA8SGVhZD5PU01TXzE8L0hlYWQ+CiAgPEJvZHk+CiAgICA8T3JkZXIKICAgICAgcmVmZXJlbmNlX25vMT0iMjAxNjAyMjUwMDAxIgogICAgICBleHByZXNzX3R5cGU9IjEwMSIKICAgICAgcGFyY2VsX3F1YW50aXR5PSIxIgogICAgICBwYXlfbWV0aG9kPSIxIgogICAgICBjdXJyZW5jeT0iVVNEIgogICAgICBqX2NvbXBhbnk9ImhhZmEiCiAgICAgIGpfY29udGFjdD0iQ3VzdG9tZXIgU2VydmljZSIKICAgICAgal90ZWw9Ijk1MTYxNjg4ODgiCiAgICAgIGpfYWRkcmVzcz0iMjI3ODAgSEFSTEVZIEtOT1ggQkxWRCBDQSBQRVJSSVMiCiAgICAgIGpfY291bnRyeT0iVVMiCiAgICAgIGpfcG9zdF9jb2RlPSI5ODg4OCIKICAgICAgZF9jb21wYW55PSLmnY7pobrkuLAiCiAgICAgIGRfY29udGFjdD0i5p2O6aG65LiwIgogICAgICBvcmRlcl9jZXJ0X3R5cGU9IklEIgogICAgICBvcmRlcl9jZXJ0X25vPSI0MzIzMDExOTczMDQwNjg4ODgiCiAgICAgIGRfYWRkcmVzcz0i5bm/5LicIOa3seWcsyDljZflsbHljLrova/ku7bkuqfkuJrln7rlnLBC5qCLMualvCIKICAgICAgZF90ZWw9IjEzMzEyOTA4ODg4IgogICAgICBkX2NvdW50cnk9IkNOIgogICAgICBkX3Bvc3RfY29kZT0iNTE4MDAwIgogICAgICBjdXN0aWQ9IjAwMTAwMDIxMTciCiAgICAgIHRheF9wYXlfdHlwZT0iMSIKICAgICAgdGF4PSJERFAiCiAgICAgIHBheW1lbnRfbnVtYmVyPSI0NDc4ODg4ODg4ODg4MDAwMDA4ODgiCiAgICAgIHBheW1lbnRfdGltZT0iMjAxNS0xMS0xMyAxMTowODoxNiIKICAgICAgcGF5bWVudF90b29sPSJWSVNBIgogICAgICBleHByZXNzX3JlYXNvbj0iMiIKICAgICAgdHJhZGVfY29uZGl0aW9uPSJDSUYiCiAgICAgIGlzX2NoYW5nZV9vcmRlciA9IjEiPgoKICAgICAgPCEtLSDpmYTliqDmnI3liqEgLS0+CiAgICAgIDxBZGRlZFNlcnZpY2UgbmFtZT0iUEtGRUUiIHZhbHVlPScxMicgdmFsdWUxPSIzMyIvPgogICAgPC9PcmRlcj4KICA8L0JvZHk+CjwvUmVxdWVzdD4K',
      validateStr: 'NzI4ZjFmNmEzYTk0NjMxN2IzMmU5NDUzYTM2YjY1YmQ=',
      customerCode: 'OSMS_1',
    };
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
      url: 'http://osms.sit.sf-express.com:2080/osms/services/OrderWebService',
    };
    const client: any = await new Soap().createClient(labelConfig);
    // const responses =
    await client['sfexpressServiceAsync'](body);
  });

  // it('getTracking', async () => {
  //   const channelConfig = {
  //     shipmentUrl: 'http://osms.sf-express.com/osms/services/OrderWebService',
  //     accountInfo: {
  //       customerCode: 'OSMS_897',
  //       checkWord: '43fbbe7bea7241df',
  //       custId: '0655001934',
  //     },
  //   };
  //   const result = await client.fetchTrackingOfficial('SF130327592101', channelConfig);
  //   console.log(result);
  // });

  it('cancel shipment', async () => {
    const result = await client.cancelShipment(
      { shippingNumber: 'SF1330024172920' },
      {
        accountInfo: {
          custId: '0655000026',
          checkWord: '43fbbe7bea7241df',
          customerCode: 'OSMS_897',
        },
      },
    );
    console.log(result);
  });
});
