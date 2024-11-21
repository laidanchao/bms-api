import crypto from 'crypto';
import _ from 'lodash';
import { MrBroker } from '@/domain/sci/transporter/broker/mr/mr.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { RelayPointDTO } from '@/domain/sci/transporter/broker/mr/mr.constraint';

const config: BaseConfig = {
  // 生产账号
  // accountInfo:{
  //   enseigne: 'F2ESENDO',
  //   privateKey: 'eSqSjALx',
  //   login: 'F2ESENDO@business-api.mondialrelay.com',
  //   password: '=aKSau'8;uo=[F;q47KW',
  //   customerId: 'F2ESENDO',
  //   versionAPI: '1.0'
  // },

  // 测试账号
  accountInfo: {
    enseigne: 'BDTEST13',
    privateKey: 'PrivateK',
    login: 'BDTEST@business-api.mondialrelay.com',
    password: ';GXyUy8cu8T2VhP>=m5j',
    customerId: 'BDTEST',
    versionAPI: '1.0',
  },
  labelFormat: {
    value: 'Generic_ZPL_10x15_200dpi',
    labelType: 'zpl',
  },
  productCode: '24R',
  // 测试地址：https://connect-api-sandbox.mondialrelay.com
  // 生产地址：https://connect-api.mondialrelay.com
  shipmentUrl: 'https://connect-api-sandbox.mondialrelay.com/',
};
const shipment: any = {
  parcel: {
    weight: 1,
    reference: '[ESENDEO] ',
    declaredWeight: 1,
    shippingFee: 5,
    insuranceFee: 0,
    insuranceValue: 0,
    remoteAreaFee: 0,
    shippingToPrivateFee: 0,
    pickupFee: 0,
    it: 6,
    vat: 1,
    et: 5,
    minWeight: 0,
    maxWeight: 5,
    minQuantity: 1,
    isMulti: false,
    pricingRangeId: 2408,
    options: {
      customsCategoryCode: 2,
      sendingReasonCode: 2,
    },
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
    postalCode: '21000',
    street1: '18 Avenue Jean Jaurès',
    street2: '21000 Dijon',
    street3: 'FR',
  },
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
    postalCode: '92170',
    street1: '25 Rue Louis Dardenne',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  options: {
    relayCountry: 'FR',
    relayPointId: '007556',
    labelEncoding: 'BASE64',
    invoiceWay: 'LAST',
  },
};

describe('MR Client', () => {
  const mrClient = new MrBroker();
  const transporter = 'Mr';

  it('sec-create parcel', async function() {
    const result = await mrClient.create(shipment, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('getTracking', async function() {
    const result = await mrClient.fetchTrackingOfficial({
      trackingNumberArray: ['97994362'],
      accountInfo: config.accountInfo,
    });
    console.log(result);
  });

  it('should MD5 secret', function() {
    const data = {
      Enseigne: 'BDTEST13',
      ModeCol: 'CCC',
      ModeLiv: '24R',
      NDossier: 'ClientOrder',
      NClient: 'ClientRef',
      Expe_Langage: 'FR',
      Expe_Ad1: 'SAddress1',
      Expe_Ad2: 'SAddress2',
      Expe_Ad3: 'SAddress3',
      Expe_Ad4: 'SAddress4',
      Expe_Ville: 'Paris',
      Expe_CP: '75000',
      Expe_Pays: 'FR',
      Expe_Tel1: '0651042196',
      Expe_Tel2: '',
      Expe_Mail: 'longweiquan@gmail.com',
      Dest_Langage: 'FR',
      Dest_Ad1: 'RAddress1',
      Dest_Ad2: 'RAddress2',
      Dest_Ad3: 'RAddress3',
      Dest_Ad4: 'RAddress4',
      Dest_Ville: 'Paris',
      Dest_CP: '75000',
      Dest_Pays: 'FR',
      Dest_Tel1: '0651042196',
      Dest_Tel2: '',
      Dest_Mail: 'longweiquan@gmail.com',
      Poids: '15',
      Longueur: '10',
      Taille: '',
      NbColis: '1',
      CRT_Valeur: '0',
      CRT_Devise: '',
      Exp_Valeur: '10',
      Exp_Devise: 'EUR',
      COL_Rel_Pays: '',
      COL_Rel: '',
      LIV_Rel_Pays: 'FR',
      LIV_Rel: '003973',
      TAvisage: 'O',
      TReprise: 'N',
      Montage: '0',
      TRDV: 'N',
      Assurance: '0',
      Instructions: 'instructions',
      // "Security": "9987831F9DBADB6B4E8478F0F29D1931",
      Texte: '',
    };
    const bodyData = _.reduce(
      data,
      (result, value) => {
        return result + value;
      },
      '',
    );
    const security = crypto
      .createHash('md5')
      .update(bodyData + 'PrivateK')
      .digest('hex')
      .toUpperCase();
    expect(security).toEqual('9987831F9DBADB6B4E8478F0F29D1931');
  });

  it('md5', async () => {
    const data = {
      Enseigne: 'BDTEST13',
      ModeCol: 'CCC',
      ModeLiv: '24R',
      NDossier: 'ref 123456',
      Expe_Langage: 'FR',
      Expe_Ad1: 'Garonor Ouest',
      Expe_Ad2: 'Bat 25G, Porte 54-58',
      Expe_Ad3: '',
      Expe_Ville: 'Aulnay sous bois',
      Expe_CP: '93600',
      Expe_Tel1: '0659969984',
      Expe_Mail: 'ddd@ggla.com',
      Dest_Langage: 'FR',
      Dest_Ad1: 'Service Intégration Technique Clients',
    };
    const bodyData = _.reduce(
      data,
      (result, value) => {
        return result + value;
      },
      '',
    );
    const privateKey = 'PrivateK';
    const encodingData = Buffer.from(bodyData + privateKey, 'utf8').toString();

    const security = crypto
      .createHash('md5')
      .update(encodingData, 'utf8')
      .digest('hex')
      .toUpperCase();
    // const temp = bodyData+privateKey;

    data['Security'] = security;
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/mr/MR.wsdl`,
      url: 'http://api.mondialrelay.com/Web_Services.asmx',
    };
    const client: any = await new Soap().createClient(labelConfig);
    const responses = await client['WSI2_CreationEtiquetteAsync'](data);
    expect(responses[0].WSI2_CreationEtiquetteResult.STAT).toEqual('97');
  });

  it('fetchTrackingOfficial', async () => {
    const params = {
      trackingNumberArray: [
        '02580978',
        '02679402',
        '02679396',
        '02679405',
        '02679510',
        '02679516',
        '02679518',
        '02671638',
        '02679515',
        '02678483',
        '02678497',
        '02679501',
        '02705137',
        '02705142',
        '02679499',
        '02678500',
        '02679403',
        '02678484',
        '02678499',
        '02705149',
        '02705154',
        '02679406',
        '02679508',
        '02705131',
        '02705147',
        '02705151',
        '02705152',
        '02709961',
        '02679407',
        '02679408',
        '02679506',
        '02705139',
        '02707249',
        '02705138',
        '02679512',
        '02705132',
        '02705134',
        '02705135',
        '02705136',
        '02705143',
        '02705144',
        '02705150',
        '02705157',
        '02705186',
        '02705146',
        '02725407',
        '02725408',
        '02725481',
        '02165309',
        '02579773',
        '02579774',
        '02579950',
        '02580979',
        '02679397',
        '02679399',
        '02679503',
        '02678487',
        '02678490',
        '02678493',
        '02678495',
        '02575232',
      ],
      accountInfo: {
        enseigne: 'F2ESENDO',
        privateKey: 'eSqSjALx',
      },
    };
    const trackingArray = await mrClient.fetchTrackingOfficial(params);
  });

  it('custom logo A6', async function() {
    const label =
      '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NjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDBdCj4+CmVuZG9iago5IDAgb2JqCjw8Ci9UeXBlL0ZvbnREZXNjcmlwdG9yCi9Bc2NlbnQgOTA1Ci9DYXBIZWlnaHQgNzE2Ci9EZXNjZW50IC0yMTIKL0ZsYWdzIDMyCi9Gb250QkJveFstNjI4IC0zNzYgMjAwMCAxMDU2XQovSXRhbGljQW5nbGUgMAovU3RlbVYgMAovWEhlaWdodCA1MTkKL0ZvbnROYW1lL0FyaWFsLEJvbGQKPj4KZW5kb2JqCjEwIDAgb2JqCjw8Ci9UeXBlL0ZvbnQKL1N1YnR5cGUvVHJ1ZVR5cGUKL0Jhc2VGb250L0FyaWFsLEJvbGQKL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZwovRm9udERlc2NyaXB0b3IgOSAwIFIKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciAyNTUKL1dpZHRoc1s3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDI3NyAzMzMgNDc0IDU1NiA1NTYgODg5IDcyMiAyMzcgMzMzIDMzMyAzODkgNTgzIDI3NyAzMzMgMjc3IDI3NyA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgMzMzIDMzMyA1ODMgNTgzIDU4MyA2MTAgOTc1IDcyMiA3MjIgNzIyIDcyMiA2NjYgNjEwIDc3NyA3MjIgMjc3IDU1NiA3MjIgNjEwIDgzMyA3MjIgNzc3IDY2NiA3NzcgNzIyIDY2NiA2MTAgNzIyIDY2NiA5NDMgNjY2IDY2NiA2MTAgMzMzIDI3NyAzMzMgNTgzIDU1NiAzMzMgNTU2IDYxMCA1NTYgNjEwIDU1NiAzMzMgNjEwIDYxMCAyNzcgMjc3IDU1NiAyNzcgODg5IDYxMCA2MTAgNjEwIDYxMCAzODkgNTU2IDMzMyA2MTAgNTU2IDc3NyA1NTYgNTU2IDUwMCAzODkgMjc5IDM4OSA1ODMgNzUwIDU1NiA3NTAgMjc3IDU1NiA1MDAgMTAwMCA1NTYgNTU2IDMzMyAxMDAwIDY2NiAzMzMgMTAwMCA3NTAgNjEwIDc1MCA3NTAgMjc3IDI3NyA1MDAgNTAwIDM1MCA1NTYgMTAwMCAzMzMgMTAwMCA1NTYgMzMzIDk0MyA3NTAgNTAwIDY2NiAyNzcgMzMzIDU1NiA1NTYgNTU2IDU1NiAyNzkgNTU2IDMzMyA3MzYgMzcwIDU1NiA1ODMgMzMzIDczNiA1NTIgMzk5IDU0OCAzMzMgMzMzIDMzMyA1NzYgNTU2IDMzMyAzMzMgMzMzIDM2NSA1NTYgODMzIDgzMyA4MzMgNjEwIDcyMiA3MjIgNzIyIDcyMiA3MjIgNzIyIDEwMDAgNzIyIDY2NiA2NjYgNjY2IDY2NiAyNzcgMjc3IDI3NyAyNzcgNzIyIDcyMiA3NzcgNzc3IDc3NyA3NzcgNzc3IDU4MyA3NzcgNzIyIDcyMiA3MjIgNzIyIDY2NiA2NjYgNjEwIDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDg4OSA1NTYgNTU2IDU1NiA1NTYgNTU2IDI3NyAyNzcgMjc3IDI3NyA2MTAgNjEwIDYxMCA2MTAgNjEwIDYxMCA2MTAgNTQ4IDYxMCA2MTAgNjEwIDYxMCA2MTAgNTU2IDYxMCA1NTZdCj4+CmVuZG9iagoxMSAwIG9iago8PAovVHlwZS9FeHRHU3RhdGUKL0NBIDEKPj4KZW5kb2JqCjEyIDAgb2JqCjw8Ci9UeXBlL0ZvbnREZXNjcmlwdG9yCi9Bc2NlbnQgOTA1Ci9DYXBIZWlnaHQgNzE2Ci9EZXNjZW50IC0yMTIKL0ZsYWdzIDMyCi9Gb250QkJveFstNjY1IC0zMjUgMjAwMCAxMDQwXQovSXRhbGljQW5nbGUgMAovU3RlbVYgMAovWEhlaWdodCA1MTkKL0ZvbnROYW1lL0FyaWFsCj4+CmVuZG9iagoxMyAwIG9iago8PAovVHlwZS9Gb250Ci9TdWJ0eXBlL1RydWVUeXBlCi9CYXNlRm9udC9BcmlhbAovRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nCi9Gb250RGVzY3JpcHRvciAxMiAwIFIKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciAyNTUKL1dpZHRoc1s3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDI3NyAyNzcgMzU0IDU1NiA1NTYgODg5IDY2NiAxOTAgMzMzIDMzMyAzODkgNTgzIDI3NyAzMzMgMjc3IDI3NyA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgMjc3IDI3NyA1ODMgNTgzIDU4MyA1NTYgMTAxNSA2NjYgNjY2IDcyMiA3MjIgNjY2IDYxMCA3NzcgNzIyIDI3NyA1MDAgNjY2IDU1NiA4MzMgNzIyIDc3NyA2NjYgNzc3IDcyMiA2NjYgNjEwIDcyMiA2NjYgOTQzIDY2NiA2NjYgNjEwIDI3NyAyNzcgMjc3IDQ2OSA1NTYgMzMzIDU1NiA1NTYgNTAwIDU1NiA1NTYgMjc3IDU1NiA1NTYgMjIyIDIyMiA1MDAgMjIyIDgzMyA1NTYgNTU2IDU1NiA1NTYgMzMzIDUwMCAyNzcgNTU2IDUwMCA3MjIgNTAwIDUwMCA1MDAgMzMzIDI1OSAzMzMgNTgzIDc1MCA1NTYgNzUwIDIyMiA1NTYgMzMzIDEwMDAgNTU2IDU1NiAzMzMgMTAwMCA2NjYgMzMzIDEwMDAgNzUwIDYxMCA3NTAgNzUwIDIyMiAyMjIgMzMzIDMzMyAzNTAgNTU2IDEwMDAgMzMzIDEwMDAgNTAwIDMzMyA5NDMgNzUwIDUwMCA2NjYgMjc3IDMzMyA1NTYgNTU2IDU1NiA1NTYgMjU5IDU1NiAzMzMgNzM2IDM3MCA1NTYgNTgzIDMzMyA3MzYgNTUyIDM5OSA1NDggMzMzIDMzMyAzMzMgNTc2IDUzNyAzMzMgMzMzIDMzMyAzNjUgNTU2IDgzMyA4MzMgODMzIDYxMCA2NjYgNjY2IDY2NiA2NjYgNjY2IDY2NiAxMDAwIDcyMiA2NjYgNjY2IDY2NiA2NjYgMjc3IDI3NyAyNzcgMjc3IDcyMiA3MjIgNzc3IDc3NyA3NzcgNzc3IDc3NyA1ODMgNzc3IDcyMiA3MjIgNzIyIDcyMiA2NjYgNjY2IDYxMCA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA4ODkgNTAwIDU1NiA1NTYgNTU2IDU1NiAyNzcgMjc3IDI3NyAyNzcgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDU0OCA2MTAgNTU2IDU1NiA1NTYgNTU2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';
    const result = await new PdfUtil().drawLogoOnLabel(label, 'ESENDEO', 'MONDIAL_RELAY', 'A6_PDF');
    if (result) {
      console.log(result);
    }
  });

  it('custom logo A5', async function() {
    const label =
      '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IDc3NyA3MjIgNjY2IDYxMCA3MjIgNjY2IDk0MyA2NjYgNjY2IDYxMCAzMzMgMjc3IDMzMyA1ODMgNTU2IDMzMyA1NTYgNjEwIDU1NiA2MTAgNTU2IDMzMyA2MTAgNjEwIDI3NyAyNzcgNTU2IDI3NyA4ODkgNjEwIDYxMCA2MTAgNjEwIDM4OSA1NTYgMzMzIDYxMCA1NTYgNzc3IDU1NiA1NTYgNTAwIDM4OSAyNzkgMzg5IDU4MyA3NTAgNTU2IDc1MCAyNzcgNTU2IDUwMCAxMDAwIDU1NiA1NTYgMzMzIDEwMDAgNjY2IDMzMyAxMDAwIDc1MCA2MTAgNzUwIDc1MCAyNzcgMjc3IDUwMCA1MDAgMzUwIDU1NiAxMDAwIDMzMyAxMDAwIDU1NiAzMzMgOTQzIDc1MCA1MDAgNjY2IDI3NyAzMzMgNTU2IDU1NiA1NTYgNTU2IDI3OSA1NTYgMzMzIDczNiAzNzAgNTU2IDU4MyAzMzMgNzM2IDU1MiAzOTkgNTQ4IDMzMyAzMzMgMzMzIDU3NiA1NTYgMzMzIDMzMyAzMzMgMzY1IDU1NiA4MzMgODMzIDgzMyA2MTAgNzIyIDcyMiA3MjIgNzIyIDcyMiA3MjIgMTAwMCA3MjIgNjY2IDY2NiA2NjYgNjY2IDI3NyAyNzcgMjc3IDI3NyA3MjIgNzIyIDc3NyA3NzcgNzc3IDc3NyA3NzcgNTgzIDc3NyA3MjIgNzIyIDcyMiA3MjIgNjY2IDY2NiA2MTAgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgODg5IDU1NiA1NTYgNTU2IDU1NiA1NTYgMjc3IDI3NyAyNzcgMjc3IDYxMCA2MTAgNjEwIDYxMCA2MTAgNjEwIDYxMCA1NDggNjEwIDYxMCA2MTAgNjEwIDYxMCA1NTYgNjEwIDU1Nl0KPj4KZW5kb2JqCjEzIDAgb2JqCjw8Ci9UeXBlL0ZvbnREZXNjcmlwdG9yCi9Bc2NlbnQgOTA1Ci9DYXBIZWlnaHQgNzE2Ci9EZXNjZW50IC0yMTIKL0ZsYWdzIDMyCi9Gb250QkJveFstNjY1IC0zMjUgMjAwMCAxMDQwXQovSXRhbGljQW5nbGUgMAovU3RlbVYgMAovWEhlaWdodCA1MTkKL0ZvbnROYW1lL0FyaWFsCj4+CmVuZG9iagoxNCAwIG9iago8PAovVHlwZS9Gb250Ci9TdWJ0eXBlL1RydWVUeXBlCi9CYXNlRm9udC9BcmlhbAovRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nCi9Gb250RGVzY3JpcHRvciAxMyAwIFIKL0ZpcnN0Q2hhciAwCi9MYXN0Q2hhciAyNTUKL1dpZHRoc1s3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDc1MCA3NTAgNzUwIDI3NyAyNzcgMzU0IDU1NiA1NTYgODg5IDY2NiAxOTAgMzMzIDMzMyAzODkgNTgzIDI3NyAzMzMgMjc3IDI3NyA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgMjc3IDI3NyA1ODMgNTgzIDU4MyA1NTYgMTAxNSA2NjYgNjY2IDcyMiA3MjIgNjY2IDYxMCA3NzcgNzIyIDI3NyA1MDAgNjY2IDU1NiA4MzMgNzIyIDc3NyA2NjYgNzc3IDcyMiA2NjYgNjEwIDcyMiA2NjYgOTQzIDY2NiA2NjYgNjEwIDI3NyAyNzcgMjc3IDQ2OSA1NTYgMzMzIDU1NiA1NTYgNTAwIDU1NiA1NTYgMjc3IDU1NiA1NTYgMjIyIDIyMiA1MDAgMjIyIDgzMyA1NTYgNTU2IDU1NiA1NTYgMzMzIDUwMCAyNzcgNTU2IDUwMCA3MjIgNTAwIDUwMCA1MDAgMzMzIDI1OSAzMzMgNTgzIDc1MCA1NTYgNzUwIDIyMiA1NTYgMzMzIDEwMDAgNTU2IDU1NiAzMzMgMTAwMCA2NjYgMzMzIDEwMDAgNzUwIDYxMCA3NTAgNzUwIDIyMiAyMjIgMzMzIDMzMyAzNTAgNTU2IDEwMDAgMzMzIDEwMDAgNTAwIDMzMyA5NDMgNzUwIDUwMCA2NjYgMjc3IDMzMyA1NTYgNTU2IDU1NiA1NTYgMjU5IDU1NiAzMzMgNzM2IDM3MCA1NTYgNTgzIDMzMyA3MzYgNTUyIDM5OSA1NDggMzMzIDMzMyAzMzMgNTc2IDUzNyAzMzMgMzMzIDMzMyAzNjUgNTU2IDgzMyA4MzMgODMzIDYxMCA2NjYgNjY2IDY2NiA2NjYgNjY2IDY2NiAxMDAwIDcyMiA2NjYgNjY2IDY2NiA2NjYgMjc3IDI3NyAyNzcgMjc3IDcyMiA3MjIgNzc3IDc3NyA3NzcgNzc3IDc3NyA1ODMgNzc3IDcyMiA3MjIgNzIyIDcyMiA2NjYgNjY2IDYxMCA1NTYgNTU2IDU1NiA1NTYgNTU2IDU1NiA4ODkgNTAwIDU1NiA1NTYgNTU2IDU1NiAyNzcgMjc3IDI3NyAyNzcgNTU2IDU1NiA1NTYgNTU2IDU1NiA1NTYgNTU2IDU0OCA2MTAgNTU2IDU1NiA1NTYgNTU2IDUwMCA1NTYgNTAwXQo+PgplbmRvYmoKMTUgMCBvYmoKPDwKL1R5cGUvRm9udERlc2NyaXB0b3IKL0FzY2VudCA4MzMKL0NhcEhlaWdodCA1NzEKL0Rlc2NlbnQgLTMwMAovRmxhZ3MgMzIKL0ZvbnRCQm94Wy0xMjIgLTY4MCA2MjMgMTAyMV0KL0l0YWxpY0FuZ2xlIDAKL1N0ZW1WIDAKL1hIZWlnaHQgNDIzCi9Gb250TmFtZS9Db3VyaWVyTmV3Cj4+CmVuZG9iagoxNiAwIG9iago8PAovVHlwZS9Gb250Ci9TdWJ0eXBlL1RydWVUeXBlCi9CYXNlRm9udC9Db3VyaWVyTmV3Ci9FbmNvZGluZy9XaW5BbnNpRW5jb2RpbmcKL0ZvbnREZXNjcmlwdG9yIDE1IDAgUgovRmlyc3RDaGFyIDAKL0xhc3RDaGFyIDI1NQovV2lkdGhzWzYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMF0KPj4KZW5kb2JqCnhyZWYKMCAxNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDE3OSAwMDAwMCBuIAowMDAwMDAwMjI3IDAwMDAwIG4gCjAwMDAwMDAyODIgMDAwMDAgbiAKMDAwMDAwMDU5NyAwMDAwMCBuIAowMDAwMDAyODkzIDAwMDAwIG4gCjAwMDAwMDMyNTIgMDAwMDAgbiAKMDAwMDAwMzk0MiAwMDAwMCBuIAowMDAwMDA2NDYxIDAwMDAwIG4gCjAwMDAwMDY1MDQgMDAwMDAgbiAKMDAwMDAwNjU0OCAwMDAwMCBuIAowMDAwMDA2NzMxIDAwMDAwIG4gCjAwMDAwMDc5MTggMDAwMDAgbiAKMDAwMDAwODA5NiAwMDAwMCBuIAowMDAwMDA5Mjc5IDAwMDAwIG4gCjAwMDAwMDk0NjEgMDAwMDAgbiAKdHJhaWxlcgo8PAovSURbPEU3MzkwOTk1MzAxN0QzNDhCMzVEODExMEQ1QTE0MzBGPjxFNzM5MDk5NTMwMTdEMzQ4QjM1RDgxMTBENUExNDMwRj5dCi9JbmZvIDEgMCBSCi9Sb290IDIgMCBSCi9TaXplIDE3Cj4+CnN0YXJ0eHJlZgoxMDY0MgolJUVPRgo=';
    const result = await new PdfUtil().drawLogoOnLabel(label, 'ESENDEO', 'MONDIAL_RELAY', 'A5_PDF');
    if (result) {
      console.log(result);
    }
  });

  it('searchRelayPointLocation by country and zipCode', async function() {
    // 1.  by country and zipCode
    const pointRelayDTO = new RelayPointDTO();
    pointRelayDTO.countryCode = 'FR';
    pointRelayDTO.zipCode = '59000';
    pointRelayDTO.numberOfResults = 3;
    const result = await mrClient.searchRelayPointLocation(pointRelayDTO, config);
    expect(result).toMatchObject([
      {
        CP: '59000',
        Distance: '95',
        Horaires_Dimanche: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['1400', '1900', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6135746',
        LgAdr1: 'KASA',
        LgAdr2: '',
        LgAdr3: '35 RUE DE LA PREVOYANCE',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0529660',
        Num: '011721',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=011721&pays=FR&crc=8993D13D498DBEC95B910A9CA9EA5B0D',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=011721&pays=FR&crc=8772E53DA1979C13FB425EBCC3BF1823',
        Ville: 'LILLE',
      },
      {
        CP: '59000',
        Distance: '96',
        Horaires_Dimanche: {
          string: ['0900', '2100', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['0700', '2200', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6296794',
        LgAdr1: 'CARREFOUR CITY FOURCHON',
        LgAdr2: '',
        LgAdr3: '187 RUE DU PONT A FOURCHON',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0242452',
        Num: '012399',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=012399&pays=FR&crc=A5011F4DAE68DD1E71227DDE5E8DB575',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=012399&pays=FR&crc=92E545BBF9E282D6753044E5973CDDD3',
        Ville: 'LILLE',
      },
      {
        CP: '59000',
        Distance: '97',
        Horaires_Dimanche: {
          string: ['0000', '0000', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['0900', '2000', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6207198',
        LgAdr1: 'UNIQUE COIN',
        LgAdr2: '',
        LgAdr3: '89 BOULEVARD MONTEBELLO',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0474922',
        Num: '010261',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=010261&pays=FR&crc=6173FE6BD69C04823531BDB38A68B750',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=010261&pays=FR&crc=9EC858EDFED43F8B6F9D79E3AEFEC484',
        Ville: 'LILLE',
      },
    ]);
  });

  it('searchRelayPointLocation by relayPointId', async function() {
    // 1.  by country and zipCode
    const pointRelayDTO = new RelayPointDTO();
    pointRelayDTO.countryCode = 'FR';
    pointRelayDTO.relayPointId = '011721';
    pointRelayDTO.numberOfResults = 3;
    const result = await mrClient.searchRelayPointLocation(pointRelayDTO, config);
    expect(result).toEqual([
      {
        CP: '59000',
        Distance: '0',
        Horaires_Dimanche: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['1400', '1900', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6135746',
        LgAdr1: 'KASA',
        LgAdr2: '',
        LgAdr3: '35 RUE DE LA PREVOYANCE',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0529660',
        Num: '011721',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=011721&pays=FR&crc=8993D13D498DBEC95B910A9CA9EA5B0D',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=011721&pays=FR&crc=8772E53DA1979C13FB425EBCC3BF1823',
        Ville: 'LILLE',
      },
    ]);
  });

  it('searchRelayPointLocation by Latitude and Longitude', async function() {
    // 1.  by country and zipCode
    const pointRelayDTO = new RelayPointDTO();
    pointRelayDTO.countryCode = 'FR';
    pointRelayDTO.latitude = '50.6135746';
    pointRelayDTO.longitude = '03.0529660';
    pointRelayDTO.numberOfResults = 3;
    const result = await mrClient.searchRelayPointLocation(pointRelayDTO, config);
    expect(result).toEqual([
      {
        CP: '59000',
        Distance: '0',
        Horaires_Dimanche: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['1400', '1900', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['1000', '1900', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6135746',
        LgAdr1: 'KASA',
        LgAdr2: '',
        LgAdr3: '35 RUE DE LA PREVOYANCE',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0529660',
        Num: '011721',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=011721&pays=FR&crc=8993D13D498DBEC95B910A9CA9EA5B0D',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=011721&pays=FR&crc=8772E53DA1979C13FB425EBCC3BF1823',
        Ville: 'LILLE',
      },
      {
        CP: '59000',
        Distance: '584',
        Horaires_Dimanche: {
          string: ['0000', '0000', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Horaires_Lundi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Horaires_Mardi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Horaires_Mercredi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Horaires_Samedi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Horaires_Vendredi: {
          string: ['1000', '1200', '1600', '1800'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6135264',
        LgAdr1: 'DESTOCK COMMERCE LILLE',
        LgAdr2: '',
        LgAdr3: '30 RUE GUSTAVE NADAUD',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0447101',
        Num: '030245',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=030245&pays=FR&crc=37B78A7CB2CCB85895216C89FC93C6B7',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=030245&pays=FR&crc=A5C1459C2A4FF9DDDCA70CB739CB73EB',
        Ville: 'LILLE',
      },
      {
        CP: '59000',
        Distance: '884',
        Horaires_Dimanche: {
          string: ['0000', '0000', '0000', '0000'],
        },
        Horaires_Jeudi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Lundi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Mardi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Mercredi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Horaires_Samedi: {
          string: ['0900', '2000', '0000', '0000'],
        },
        Horaires_Vendredi: {
          string: ['0800', '2000', '0000', '0000'],
        },
        Information: '',
        Informations_Dispo: null,
        Latitude: '50,6207198',
        LgAdr1: 'UNIQUE COIN',
        LgAdr2: '',
        LgAdr3: '89 BOULEVARD MONTEBELLO',
        LgAdr4: '',
        Localisation1: '',
        Localisation2: '',
        Longitude: '03,0474922',
        Num: '010261',
        Pays: 'FR',
        STAT: '',
        TypeActivite: '000',
        URL_Photo:
          'https://ww2.mondialrelay.com/public/permanent/photo_relais.aspx?ens=CC______41&num=010261&pays=FR&crc=6173FE6BD69C04823531BDB38A68B750',
        URL_Plan:
          'https://ww2.mondialrelay.com/public/permanent/plan_relais.aspx?ens=BDTEST1311&num=010261&pays=FR&crc=9EC858EDFED43F8B6F9D79E3AEFEC484',
        Ville: 'LILLE',
      },
    ]);
  });

  it('generalte sign', function() {
    const data = {
      Enseigne: 'F2ESENDO',
      Expedition: '02748184',
      Langue: 'EN',
    };
    const re = new MrBroker()._signedForData(data, {
      privateKey: 'eSqSjALx',
    });
    expect(re.Security).not.toBeNull();
  });
});
