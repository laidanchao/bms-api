export enum LastmileProviderTypeEnum {
  TRANSPORTER_DECLARE = 'TRANSPORTER_DECLARE', // 派送商告知，例如ESPOST
  TRANSPORTER_DEFAULT = 'TRANSPORTER_DEFAULT', // 取transporter表内配置的lastmile_provider
  CMS_IDENTIFICATION = 'CMS_IDENTIFICATION', //根据单号特征识别，识别不到transporter表内配置的lastmile_provider
}
