import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';

export class DhlOption extends TransporterOption {
  whetherCustomsClearance?: boolean;

  invoiceNumber?: string;
  /**
   * 'YYYY-MM-DD'
   */
  invoiceDate?: string;

  customsInvoiceType?: CustomsInvoiceType;

  requireDHLCustomsInvoice?: boolean;

  shippingPaymentType?: ShippingPaymentType;

  specialServices?: SpecialServiceType[];

  pickupAt?: string;

  paymentInfo?: string;

  shipperRegistrationNumbers: RegistrationNumber[];
  recipientRegistrationNumbers: RegistrationNumber[];
}

/**
 * Please note if you use value R or T in this tag then the next tag <BillingAccountNumber> is also mandatory
 */
export enum ShippingPaymentType {
  // (use ShipperAccountNumber as payer)
  S = 'S',
  // (use BillingAccountNumber as bill-to receiver account number)
  R = 'R',
  // (use BillingAccountNumber as billto third party account number)
  T = 'T',
}

export enum CustomsInvoiceType {
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  PROFORMA_INVOICE = 'PROFORMA_INVOICE',
}

/**
 * NON_DOCUMENTS: 需要清关, DOCUMENTS:不需要清关
 */
export enum CustomsClearanceType {
  DOCUMENTS = 'DOCUMENTS',
  NON_DOCUMENTS = 'NON_DOCUMENTS',
}

export enum RequireDHLCustomsInvoice {
  Y = 'Y',
  N = 'N',
}

export enum DhlProductCode {
  N = 'N',
  U = 'U',
  D = 'D',
  P = 'P',
}

export enum SpecialServiceType {
  INSURANCE_SERVICE = 'II',
  PAPERLESS_TRADE_SERVICE = 'WY',
}

export enum LogoImageFormat {
  PNG = 'PNG',
  GIF = 'GIF',
  JPEG = 'JPEG',
  JPG = 'JPG',
}

export class RegistrationNumber {
  // Registration Number of the Shipper
  number: string;
  // Type of the registration number.
  numberTypeCode: string;
  // code of country
  numberIssuerCountryCode: string;
}
