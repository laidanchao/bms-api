import { ShipmentAddress } from '@/domain/sci/transporter/contants';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { WelcoBroker } from '@/domain/sci/transporter/broker/welco/welco.broker';
const config: BaseConfig = {
  // 生产账号
  accountInfo: {
    email: 'delong@esendeo.com',
    password: 'Welco2023'
  },
  labelFormat: {
    labelType: 'pdf',
    value: 'PDF',
    code: '10x15_PDF',
  },
  shipmentUrl: 'https://api.preprod.welco.io',
};

const shipment = {
  senderAddress: {
    city: 'paris',
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
    firstName: 'x',
    lastName: 'm',
  },
  receiverAddress: ShipmentAddress.FR,
  options: {},
  parcel: {
    reference: 'refWZ-customize',
    weight: 3.5,
    height: 10,
    width: 10,
    length: 10,
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

describe('WELCO Client', () => {
  const client = new WelcoBroker();
  const transporter = 'Welco';
  it('create parcel', async () => {
    const result = await client.create(shipment, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('cancel parcel', async () => {
    const result = await client.cancelShipment({ shippingNumber:'65378211b96945b20acfd7b3' }, config);
    expect(result.success).toEqual(true);
  });

  it('tracking', async () => {
    const result = await client.fetchTrackingOfficial({
      trackingNumberArray: [''],
      accountInfo: config.accountInfo,
    });
  });
});
