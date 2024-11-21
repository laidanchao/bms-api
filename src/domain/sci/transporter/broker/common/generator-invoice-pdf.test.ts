import { GeneratorInvoicePdf } from '@/domain/sci/transporter/broker/common/generate-invoice-pdf';
import * as fs from 'fs';

const shipment = {
  senderAddress: {
    city: 'paris',
    client: 65,
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
    type: 'sender',
    EORI: '123',
    vatNumber: '456',
  },
  receiverAddress: {
    city: 'SCHKEUDITSZ',
    client: 65,
    comment: '',
    company: 'X sociale company',
    countryCode: 'DE',
    email: 'ddd@ggla.com',
    firstName: 'firstR',
    lastName: 'lastR',
    mobileNumber: '0659969984',
    phoneNumber: '0159969984',
    postalCode: '75013',
    street1: '6 LONDON STREET',
    street2: 'receiver street address 2 ds',
    street3: 'receiver street address 3 ds',
    type: 'receiver',
  },
  parcel: {
    reference: 'reference223',
    weight: 1.2,
    options: {
      sendingReasonCode: 0,
      customsCategoryCode: 5,
    },
    items: [
      {
        description: 'pull',
        quantity: 3,
        weight: 0.33,
        value: 9,
        originCountry: 'CN',
        hsCode: 123456,
      },
      {
        description: 'robe',
        quantity: 10,
        weight: 0.33,
        value: 9,
        originCountry: 'CN',
        hsCode: 123456,
      },
      {
        description: 'test',
        quantity: 12,
        weight: 0.3,
        value: 2,
        originCountry: 'CN',
        hsCode: 123456,
      },
    ],
  },
  pickupAt: '2018-09-30 00:00:00+02',
  shippingDate: '2021-08-04T05:41:19.023Z',
  transporter: 'CHRONOPOST',
  account: {
    accountNumber: '19999700',
    password: '058888',
  },
  options: {},
  trackingNumber: '1ZXXXXXX',
};

describe('GeneratorInvoicePdf', () => {
  it('should generateInvoiceDefault', async function() {
    const result = GeneratorInvoicePdf.generator(shipment);
    fs.writeFileSync('temp/generateInvoiceDefault.pdf', result, 'base64');
  });

  it('should generateInvoiceForESENDEO', function() {
    shipment.options = {
      invoiceWay: 'LAST',
    };
    const result = GeneratorInvoicePdf.generator(shipment);
    fs.writeFileSync('temp/generateInvoiceForESENDEO.pdf', result, 'base64');
  });
});
