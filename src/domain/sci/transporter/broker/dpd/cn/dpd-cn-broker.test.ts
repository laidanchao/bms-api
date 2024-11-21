import { DpdCnBroker } from '@/domain/sci/transporter/broker/dpd/cn/dpd-cn.broker';
import { defaultShipment } from '@/domain/sci/transporter/contants';
import moment from 'moment';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config: BaseConfig = {
  // 测试账号
  accountInfo: {
    center: '77',
    number: '18026',
    password: 'test',
    username: 'test',
    countryCode: '250',
  },
  labelFormat: {
    value: 'PDF',
    labelType: 'pdf',
  },
  shipmentUrl: 'http://www.hub-ez.com/api/',
  productCode: 'ADC',
};

const shipmentDto: any = {
  senderAddress: {
    city: 'Carpentras',
    comment: '',
    company: 'Loicar',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '84200',
    street1: '429 allée bellecour',
    street2: '',
    street3: '',
  },
  receiverAddress: {
    city: 'Toulouse',
    comment: '',
    company: 'LC Purpan',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'Loic ',
    lastName: 'Raymond',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '31300',
    street1: '36 route de bayonne',
    street2: 'receiver complement C/C Carrefour, Indémodable',
    street3: '',
  },
  labelFormat: 'A4_PDF',
  parcel: {
    reference: 'ref 862981',
    weight: 1,
    items: [
      {
        description: 'test desc',
        quantity: 1,
        weight: 0.1,
        value: 1,
        originCountry: 'CN',
        hsCode: '123456',
      },
    ],
    insuranceValue: 10,
  },
  shippingDate: new Date(),
  code: 'DPD_CMS_STD',
  platform: 'CMS',
  options: {
    contactType: 'Predict',
    contactSms: '123',
    pickupAt: '2021-09-14',
  },
};

describe('DPD Client', () => {
  const client = new DpdCnBroker();
  const transporter = 'Dpd';

  it('sec-create parcel', async () => {
    const result = await client.create(shipmentDto, config);
    expect(result).not.toBeNull();
    console.log(result);
  });

  it('should fetchTrackingUnofficial', async function() {
    const results = await client.fetchTrackingUnofficial({
      trackingNumberArray: ['AFREQK000058006'],
    });
    expect(results.length).toEqual(1);
  });

  it('should label format A6', async () => {
    config.labelFormat.value = 'PDF_A6';
    const result = await client.create(defaultShipment, config);
    expect(result).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  //测试环境不能取件
  it('should with pick up test by client', async () => {
    const pickupDay = moment()
      .day(1 + 7)
      .toDate();
    defaultShipment.pickupAt = pickupDay;

    await client.create(defaultShipment, config);
  });
});
