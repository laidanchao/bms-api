import { GeodisBroker } from '@/domain/sci/transporter/broker/geodis/geodis.broker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { AddressDto } from '@/domain/ord/parcel/dto';

describe('GEODIS broker test', () => {
  const shipment: any = {
    shippingDate: '2022-06-14T04:41:47.000Z',
    options: {
      receiverId: '110225196403026127',
    },
    senderAddress: {
      province: 'Seine-St-Denis (93)',
      city: 'ST DENIS',
      comment: '',
      company: '',
      countryCode: 'FR',
      email: '',
      firstName: 'Mme Johnson',
      lastName: '',
      mobileNumber: '0641241182',
      phoneNumber: '0641241182',
      postalCode: '93210',
      street1: '8 - 10 Mail Ada Lovelace',
      street2: '',
      street3: '',
      eori: '',
    },
    receiverAddress: {
      city: 'charleville-mézières',
      comment: '',
      company: '',
      countryCode: 'FR',
      email: '',
      firstName: 'DUPONT',
      lastName: '',
      mobileNumber: '0612866559',
      phoneNumber: '0122554400',
      postalCode: '08000',
      street1: '38 RUE DE LA PAIX',
      street2: '',
      street3: '',
    },
    labelFormat: '100x150',
    parcel: {
      insuranceValue: 0,
      options: {},
      reference: 'FTL00904162FR',
      weight: 3.28,
      length: 10,
      width: 8,
      height: 6,
    },
    description: '法国Guigoz古戈士2段标准奶粉900g',
    code: 'SF_EXP_1981',
    platform: 'FTL-EXPRESS',
    quantity: 1,
    trayQuantity: 1,
    totalWeight: 2,
  };

  const pickUp: any = {
    channel: 'GDS_ESD_MES',
    quantity: 1,
    pickupAt: '2022-06-13 00:11:11',
    senderAddress: {
      province: 'Seine-St-Denis (93)',
      city: 'ST DENIS',
      comment: '',
      company: '',
      countryCode: 'FR',
      email: '',
      firstName: 'Mme Johnson',
      lastName: '',
      mobileNumber: '0641241182',
      phoneNumber: '0641241182',
      postalCode: '93210',
      street1: '8 - 10 Mail Ada Lovelace',
      street2: '',
      street3: '',
      eori: '',
    },
    totalWeight: 1,
    trayQuantity: 1,
  };

  const channelConfig = {
    productCode: 'MES',
    accountInfo: {
      id: 'ESENDEOTEST',
      password: 'Geodis2022',
      apiKey: '1c2c5926cc294e4d94cc9f558c909c41',
      agency: '001892',
      account: '057567',
    },
    shipmentUrl: 'https://espace-client-rct.geodis.com/services/',
    // shipmentUrl: 'https://espace-client.geodis.com/services-mock/',
    labelFormat: {
      value: 'P',
    },
  };

  it('sec-create', async () => {
    const geodisBroker = new GeodisBroker();
    const result = await geodisBroker.create(shipment, channelConfig);
    expect(result).not.toBeNull();
  });

  it('encode', () => {
    const geodisBroker = new GeodisBroker();
    const accoungInfo = {
      apiKey: 'd89b703bfe0d440a966ff3d996f5936a',
      id: 'QTTCLT',
    };
    const data = {
      dateDepart: '',
      dateDepartDebut: '2018-12-09',
      dateDepartFin: '2019-01-08',
      noRecepisse: '',
      reference1: '',
      cabColis: '',
      noSuivi: '',
      codeSa: '084135',
      codeClient: '',
      codeProduit: '',
      typePrestation: 'EXP',
      dateLivraison: '',
      refDest: '',
      nomDest: '',
      codePostalDest: '',
      natureMarchandise: '',
    };
    const result = geodisBroker['encodeData'](
      accoungInfo,
      1546941256145,
      'fr',
      'api/zoomclient/recherche-envois',
      data,
    );
    expect(result).toEqual('1b59ef28395469bdd3c823adc2603c469c657ed968e96375b0095307e0460fdf');
  });

  it('schedulePickup', async () => {
    const geodisBroker = new GeodisBroker();

    const result = await geodisBroker.schedulePickup(pickUp, channelConfig);
    expect(result).not.toBeNull();
  });

  it('cancelPickup', async () => {
    const geodisBroker = new GeodisBroker();
    const dto = {
      pickupRequestNumber: 70106302,
    };
    const result = await geodisBroker.cancelPickup(dto, channelConfig);
    expect(result).not.toBeNull();
  });
});
