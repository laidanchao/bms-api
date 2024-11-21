import { ColissimoBroker } from '@/domain/sci/transporter/broker/colissimo/colissimo.broker';

import {
  colissimo966036Account,
  defaultShipment,
  defaultShipmentWithItems,
  ShipmentAddress,
} from '@/domain/sci/transporter/contants';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import _ from 'lodash';
import papa from 'papaparse';
import * as fs from 'fs';
import RemoveAccents from 'remove-accents';
const config: BaseConfig = {
  // 生产账号
  accountInfo: { password: 'Colissimo+123', contractNumber: '964836' },
  labelFormat: {
    labelType: 'pdf',
    value: 'PDF_10x15_300dpi',
    code: '10x15_PDF',
  },
  productCode: 'DOM',
  shipmentUrl: 'https://ws.colissimo.fr/f5af0e9ebdb392e029156b046f5a4de0/sls-ws/SlsServiceWS/2.0',
};

const shipment = {
  senderAddress: {
    city: 'paris',
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    lastName: null,
    firstName: null,
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  receiverAddress: ShipmentAddress.FR,
  options: {},
  parcel: {
    reference: 'refWZ-customize',
    weight: 3.5,
    items: [
      {
        originCountry: 'CN',
        description: 'GALLIA BEBE EXPERT HA 2 800G',
        quantity: 2,
        weight: 1,
        value: 0.5,
        hsCode: '0402291100',
      },
      {
        originCountry: 'CN',
        description: 'GALLIA BEBE EXPERT HA 2 800G',
        quantity: 2,
        weight: 0.5,
        value: 1,
        hsCode: '0402291100',
      },
    ],
    options: {
      customsCategory: 1,
    },
  },
};

describe('Colissimo Client', () => {
  const client = new ColissimoBroker();
  const transporter = 'Colissimo';
  it('should remove xiaoyuzhong', function() {
    const value = '،,⁰,ė,́,​,ď,İ,İ,Ć,ė,ğ,ı,İ,ç';
    const actual = RemoveAccents.remove(value);
    expect(actual).toEqual('،,⁰,e,́,​,d,I,I,C,e,g,i,I');
    const regNoneISO_8859_1 = /[^\u0000-\u00FF]/g;
    expect(actual.replace(regNoneISO_8859_1, '')).toEqual(',,e,,,d,I,I,C,e,g,i,I');
  });

  it('sec-create parcel', async () => {
    const result = await client.create(shipment, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('should fetchTrackingUnofficial', async function() {
    const trackingSet = await client.fetchTrackingUnofficial({
      trackingNumberArray: ['6G57751990333'],
    });
    const result = _.chain(trackingSet)
      .groupBy('trackingNumber')
      .map((values, trackingNumber) => {
        let reason = '';

        const v = _.chain(values)
          .uniqBy('event')
          .filter(tracking => ['SOL_MQD', 'REN_CAD', 'DO3', 'PB1', 'AG1', 'RE1', 'ND1'].includes(tracking.event))
          .value();
        _.forEach(v, tracking => {
          reason += tracking.description + '\n';
        });
        return { trackingNumber, reason };
      })
      .value();
    console.log('result->', result);
    const csv = papa.unparse(result);
    fs.writeFileSync('./result.csv', csv);
    // const parcel = {
    //   status: 'CREATED',
    // };
    // const newparcel = await client.handleTracking(parcel, result);
    // expect(newparcel.status).toEqual('CREATED');
  });

  it('test 10x10', async () => {
    config.labelFormat.value = 'PDF_10x10_300dpi';
    config.labelFormat.code = '10x10_PDF';
    const result = await client.create(defaultShipment, config);
    expect(result).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('should simple create', async function() {
    config.labelFormat.value = 'PDF_10x15_300dpi';
    config.productCode = 'COLR';
    config.accountInfo = colissimo966036Account;
    config.shipmentUrl = 'https://ws.colissimo.fr/f5af0e9ebdb392e029156b046f5a4de0/sls-ws/SlsServiceWS/2.0';

    defaultShipment.receiverAddress = {
      city: 'BRAGELOGNE BEAUVOIR',
      comment: '',
      company: 'X sociale company',
      countryCode: 'FR',
      email: 'ddd@ggla.com',
      firstName: 'firstR',
      lastName: 'lastR',
      mobileNumber: '0659969984',
      phoneNumber: '0159969984',
      postalCode: '10340',
      street1: '4 BOULEVARD MORLAND',
      street2: '',
      street3: '',
    };
    try {
      const result = await client.create(defaultShipment, config);
      await writeLabelAndLog(transporter, result);
    } catch (e) {
      console.log(e.message);
    }
  });

  it('test', async () => {
    const map = {
      '03270': 'ST YORRE',
    };
    const resultList = [];
    for (const postalCode in map) {
      shipment.receiverAddress.postalCode = postalCode;
      shipment.receiverAddress.city = map[postalCode];
      const result: any = {
        city: map[postalCode],
        postalCode: postalCode,
      };
      try {
        const response = await client.create(shipment, config);
        result.trackingNumber = response.trackingNumber;
      } catch (e) {
        result.error = e.message;
      }
      resultList.push(result);
    }

    if (1) {
      const csv = papa.unparse(resultList);
      fs.writeFileSync('./parcelResult.csv', csv);
      console.log(JSON.stringify(resultList));
    }
  });

  // 欧洲路线暂时没保险
  it.skip('欧洲签字保险', async () => {
    config.productCode = 'DOS';
    defaultShipmentWithItems.parcel.insuranceValue = 10;
    const result = await client.create(defaultShipmentWithItems, config);
    await writeLabelAndLog(transporter, result);
  });
});
