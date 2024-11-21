import { CreateTransporterDto } from '@/domain/sci/transporter/dto/create-transporter.dto';

export const transporters: CreateTransporterDto[] = [
  {
    id: 'COLISSIMO',
    name: '法邮',
    accountAttribute: [
      { attribute: 'contractNumber', required: true },
      { attribute: 'password', required: true },
    ],
    shipmentUrl: [
      {
        environment: 'production',
        url: 'https://ws.colissimo.fr/f5af0e9ebdb392e029156b046f5a4de0/sls-ws/SlsServiceWS/2.0',
      },
      { environment: 'test', url: 'http://qualification.colissimo.fr/sls-ws/SlsServiceWS/2.0' },
    ],
    labelFormatsEnum: [
      'PDF_10x15_300dpi',
      'PDF_A4_300dpi',
      'ZPL_10x15_203dpi',
      'ZPL_10x15_300dpi',
      'DPL_10x15_203dpi',
      'DPL_10x15_300dpi',
    ],
  },
  {
    id: 'CORREOS',
    name: 'CORREOS',
    accountAttribute: [
      { attribute: 'username', required: true },
      { attribute: 'password', required: true },
      { attribute: 'labeler', required: true },
    ],
    shipmentUrl: [
      { environment: 'production', url: 'https://preregistroenvios.correos.es/preregistroenvios' },
      { environment: 'test', url: 'https://preregistroenviospre.correos.es/preregistroenvios' },
    ],
  },
  {
    id: 'UPS',
    name: 'UPS',
    accountAttribute: [
      { attribute: 'number', required: true },
      { attribute: 'username', required: true },
      { attribute: 'password', required: true },
      { attribute: 'AccessLicenseNumber', required: true },
    ],
    shipmentUrl: [
      { environment: 'production', url: 'https://onlinetools.ups.com/webservices/Ship' },
      { environment: 'test', url: 'https://wwwcie.ups.com/webservices/Ship' },
    ],
    labelFormatsEnum: ['GIF', 'PNG'],
  },
  {
    id: 'CHRONOPOST',
    name: 'CHRONOPOST',
    accountAttribute: [
      { attribute: 'accountNumber', required: true },
      { attribute: 'password', required: true },
      { attribute: 'subAccount', required: false },
    ],
    shipmentUrl: [
      { environment: 'production', url: 'https://ws.chronopost.fr/shipping-cxf/ShippingServiceWS' },
      { environment: 'test', url: 'https://ws.chronopost.fr/shipping-cxf/ShippingServiceWS' },
    ],
    labelFormatsEnum: ['THE', 'PPR', 'Z2D', 'ZPL300'],
  },
  {
    id: 'GLS',
    name: 'GLS',
    accountAttribute: [
      { attribute: 'login', required: true },
      { attribute: 'password', required: true },
      { attribute: 'shipperID', required: true },
    ],
    shipmentUrl: [
      { environment: 'production', url: 'https://api.gls-group.eu/public/v1/shipments' },
      { environment: 'test', url: 'https://api-qs.gls-group.eu/public/v1/shipments' },
    ],
    labelFormatsEnum: ['A4', 'A5', 'A6'],
  },
  {
    id: 'DPD',
    name: 'DPD',
    accountAttribute: [
      { attribute: 'username', required: true },
      { attribute: 'password', required: true },
      { attribute: 'number', required: true },
      { attribute: 'center', required: true },
      { attribute: 'countryCode', required: false },
    ],
    shipmentUrl: [
      {
        environment: 'production',
        url: 'https://e-station.cargonet.software/dpd-eprintwebservice/eprintwebservice.asmx',
      },
      { environment: 'test', url: 'http://92.103.148.116/exa-eprintwebservice/eprintwebservice.asmx' },
    ],
    labelFormatsEnum: ['PDF', 'PDF_A6'],
  },
  {
    id: 'FEDEX',
    name: 'FEDEX',
    accountAttribute: [
      { attribute: 'Key', required: true },
      { attribute: 'Password', required: true },
      { attribute: 'AccountNumber', required: true },
      { attribute: 'MeterNumber', required: true },
    ],
    shipmentUrl: [
      { environment: 'test', url: 'https://ws.fedex.com/web-services/ship' },
      { environment: 'production', url: 'https://ws.fedex.com:443/web-services/ship' },
    ],
  },
  {
    id: 'ASENDIA',
    name: 'ASENDIA',
    accountAttribute: [
      { attribute: 'ApiToken', required: true },
      { attribute: 'access_token', required: true },
    ],
    shipmentUrl: [
      { environment: 'test', url: 'http://api.asendiahk.com/openapi/user/1.2/addOrUpdateOrder' },
      { environment: 'production', url: 'http://api.asendiahk.com/openapi/user/1.2/addOrUpdateOrder' },
    ],
    labelFormatsEnum: ['Label_100x150'],
  },
  {
    id: 'COLISPRIVE',
    name: 'COLISPRIVE',
    accountAttribute: [
      { attribute: 'username', required: true },
      { attribute: 'password', required: true },
      { attribute: 'CPCustoID', required: true },
      { attribute: 'AccountID', required: true },
    ],
    shipmentUrl: [
      { environment: 'test', url: 'https://www.test.colisprive.com/Externe/WSCP.asmx' },
      { environment: 'production', url: 'https://www.colisprive.com/Externe/WSCP.asmx' },
    ],
    labelFormatsEnum: ['PDF_DEFAUT', 'PDF_ZEBRA', 'ZPL_200'],
  },
  {
    id: 'XBS',
    name: 'XBS',
    accountAttribute: [
      { attribute: 'login', required: true },
      { attribute: 'password', required: true },
    ],
    shipmentUrl: [
      { environment: 'test', url: 'https://mtapi.net/?testMode=1' },
      { environment: 'production', url: 'https://mtapi.net/' },
    ],
  },
  {
    id: 'GLS_ES',
    name: 'GLS_ES',
    accountAttribute: [{ attribute: 'uidcliente', required: true }],
    shipmentUrl: [
      { environment: 'test', url: 'https://wsclientes.asmred.com/b2b.asmx?wsdl' },
      { environment: 'production', url: 'https://wsclientes.asmred.com/b2b.asmx?wsdl' },
    ],
  },
];
