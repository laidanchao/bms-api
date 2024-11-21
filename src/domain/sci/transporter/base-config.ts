export class BaseConfig {
  productCode?: string | number;
  accountInfo: Record<string, string>;
  shipmentUrl: string;
  // labelFormat: { code?: string; value: string; labelType: string }; // code value -- 服务商面单代码; labelType -- 面单文件类型
  labelFormat: any; // code value -- 服务商面单代码; labelType -- 面单文件类型
  ftlRoute?: string;
  isDeliverSat?: boolean; // CHRONOPOST 使用.
  transporterId?: string;
  platform?: string;
  webServiceUrl?: string;
}
