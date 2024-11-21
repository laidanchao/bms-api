export class IChannelConfig {
  transporterId: string;
  isUploadS3: boolean;
  code: string;
  isActive: boolean;
  isSupportMulti: boolean;
  isSupportInsurance: boolean;
  platform: string;
  productCode: string;
  accountInfo: Record<string, string>;
  shipmentUrl: string;
  account: string;
  maxInsuranceValue: number;
  labelFormats: { code: string; value: string; labelType: string }[];
  labelFormat: { code: string; value: string; labelType: string } | string;
  ftlRoute?: string;
  isDeliverSat: boolean;
  isClientAccount: boolean;
  senderAddressCode: string;
}
