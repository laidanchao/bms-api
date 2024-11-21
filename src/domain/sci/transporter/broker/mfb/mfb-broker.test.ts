import { ShipmentAddress } from '@/domain/sci/transporter/contants';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { MfbBroker } from '@/domain/sci/transporter/broker/mfb/mfb.broker';

const accountInfo = {
  login: 'fa934ff32cd1df1bc0609b7051d08b2d',
  password: 'qz7N2PbspTDKzRW2Q2v4mTbE2tpSba2r',
};
const config: BaseConfig = {
  // 生产账号
  accountInfo,
  labelFormat: {
    labelType: 'pdf',
    value: 'PDF_10x15_300dpi',
    code: '10x15_PDF',
  },
  productCode: 'chronopost_chrono_18',
  shipmentUrl: 'https://test.myflyingbox.com/v2',
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

describe('MFB Client', () => {
  const client = new MfbBroker();
  it('Create parcel', async () => {
    const result = await client.create(shipment, config);
    expect(result.label).not.toBeNull();
  });

  it('fetch trackingOfficial', async () => {
    const params = {
      trackingNumberPostCodeArray: [
        {
          shippingNumber: '80181945-5c67-4517-946e-dd80202d8f29',
          trackingNumber: 'XW761104119JB',
        },
      ],
      accountInfo,
    };
    const trackingArray = await client.fetchTrackingOfficial(params);
    return trackingArray;
  });

  it('Cancel parcel', async () => {
    const params = {
      shippingNumber: '9ae4987e-97ac-48c8-9c1b-c601a9ad3681',
    };
    const result = await client.cancelShipment(params, config);
    return result;
  });
});
