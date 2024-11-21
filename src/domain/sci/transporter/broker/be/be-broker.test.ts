import * as fs from 'fs';
import request from 'request-promise';
import { XmlParser } from '@/domain/sci/transporter/broker/common/xml-parser';
import { BeBroker } from '@/domain/sci/transporter/broker/be/be.broker';
import { defaultShipment } from '@/domain/sci/transporter/contants';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

// PRODUCTION!
// AccountInfo: { clientId: '1635', password: '123456.Ftl', username: 'FTL_API' /*accountNumber: 'L1635A' */ },
const channelConfig = {
  productCode: 'LGINTBPMU',
  // STAGING
  accountInfo: { clientId: '218', password: 'demo123', username: 'demoapi' /*accountNumber: 'L1635A' */ },
  shipmentUrl: 'https://api.landmarkglobal.com/v2/Ship.php',
  labelFormat: {
    value: 'PDF',
    labelType: 'pdf',
  }, // code value -- 服务商面单代码; labelType -- 面单文件类型
};

const shipment = {
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
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  receiverAddress: {
    city: 'HangZhou',
    comment: '',
    company: 'X sociale',
    countryCode: 'CN',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '310000',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  parcels: [
    {
      reference: 'ref123456',
      weight: 1,
      items: [
        {
          originCountry: 'CN',
          description: 'GALLIA BEBE EXPERT HA 2 800G',
          quantity: 1,
          weight: 1,
          value: 16,
          hsCode: '0402291100',
        },
      ],
    },
  ],
};

describe('BE Client', function() {
  const client = new BeBroker();
  const transporter = 'Be';

  it('sec-create parcel', async function() {
    const result = await client.create(shipment, channelConfig);
    expect(result[0].label).not.toBeNull();
    await writeLabelAndLog(transporter, result[0]);
  });

  it('create', async function() {
    const xmlString = await fs.readFileSync(`${__dirname}/BeCreateLabel.xml`).toString();
    const options = {
      uri: 'https://api.landmarkglobal.com/v2/Ship.php',
      method: 'POST',
      // encoding: null,
      body: xmlString,
      // 这个真的需要加吗?
      // headers: {
      //   'Content-type': 'text/xml'
      // }
    };
    const result = await request(options);
    expect(result).not.toBeNull();
  });

  it('getTracking', async function() {
    const accountInfo = {
      clientId: 1635,
      password: '123456.Ftl',
      username: 'FTL_API',
      accountNumber: 'L1635A',
    };
    const results = await client.fetchTrackingOfficial({ trackingNumberArray: ['EC129557668BE'], accountInfo });
    for (const result of results) {
      expect(result.trackingNumber).toEqual('EC129557668BE');
    }
    const parcel = {
      status: 'CREATED',
    };
    const newParcel = await client.handleTracking(parcel, results);
    expect(newParcel.status).toEqual('ARRIVED');
  });

  it('transfer create xml to data', async function() {
    const xmlParser = new XmlParser();
    const xmlString = await fs.readFileSync(`${__dirname}/BeCreateLabel.xml`).toString();
    const obj = xmlParser.parseXmlString2Obj(xmlString);
    expect(obj).toMatchObject({
      ShipRequest: {
        Login: { Username: 'demoapi', Password: 'demo123' },
        Test: 'true',
        ClientID: '218',
        AccountNumber: 'L0218A',
        Reference: '3245325',
        ShipTo: {
          Name: 'Test Company',
          Attention: 'Sven Larsson',
          Address1: '12 Avenue du Valquiou',
          Address2: '',
          Address3: '',
          City: 'Tremblay-en-France',
          State: 'Tremblay-en-France',
          PostalCode: '93290',
          Country: 'FR',
          Phone: '1-519-737-9101',
          Email: 'orders@test.com',
          ConsigneeTaxID: '12345',
        },
        ShipMethod: 'LGINTSTD',
        OrderTotal: '187.98',
        OrderInsuranceFreightTotal: '20.65',
        ShipmentInsuranceFreight: '20.65',
        ItemsCurrency: 'EUR',
        IsCommercialShipment: '0',
        LabelFormat: 'PDF',
        LabelEncoding: 'BASE64',
        ReturnInformation: {
          OutboundShipment: {
            Reference: '12932',
            TrackingNumber: 'LTN123212',
          },
          Condition: 'Damaged',
          RMANumber: 'RMA12321',
          Notes: 'The shipment was damaged in transit.',
          Reason: 'Did Not Want',
        },
        FulfillmentAddress: {
          Name: 'Acme Warehouse',
          Attention: 'Returns Dept.',
          Address1: '12 Avenue du Valquiou',
          Address2: '',
          Address3: '',
          City: 'Tremblay-en-France',
          State: 'Tremblay-en-France',
          PostalCode: '93290',
          Country: 'FR',
        },
        AdditionalFields: {
          Field1: 'Any type of data',
          Field2: 'Purchased with Credit Card',
          Field3: '99000029327172321',
          Field4: '123198012',
          Field5: 'Stored information',
        },
        Packages: {
          Package: [
            {
              DimensionsUnit: 'CM',
              Height: '12',
              PackageReference: '98233312',
              Weight: '4.5',
              WeightUnit: 'KG',
            },
            {
              DimensionsUnit: 'CM',
              Height: '13',
              Length: '6',
              PackageReference: '98233313',
              Weight: '5.2',
              WeightUnit: 'KG',
              Width: '4',
            },
          ],
        },
        Items: {
          Item: [
            {
              CountryOfOrigin: 'CN',
              Description: "Women's Shoes",
              HSCode: '640399.30.00',
              Quantity: '2',
              Sku: '7224059',
              UnitPrice: '93.99',
            },
            {
              CountryOfOrigin: 'CN',
              Description: "Men's Shoes",
              HSCode: '640399.30.00',
              Quantity: '1',
              Sku: '7224060',
              UnitPrice: '53.99',
            },
          ],
        },
        FreightDetails: { ProNumber: 'LGBR020409E', PieceUnit: 'Pallet' },
      },
    });
  });

  it('should _buildXmlString', function() {
    const result = client['_buildXmlString'](defaultShipment, channelConfig);
    expect(result).not.toBeNull();
  });
});
