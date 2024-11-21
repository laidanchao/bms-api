export enum SiteType {
  'OFFICIAL_SITE' = 'OFFICIAL_SITE',
  'OSC' = 'OSC',
  'UNOFFICIAL_SITE' = 'UNOFFICIAL_SITE',
}
export class CrawlerTargetManualDto {
  filePath: string;

  transporter: string;

  //派送商是法邮,官网/osc
  transporterSite: SiteType;

  //派送商是法邮,账号id
  transporterAccountId?: string;
}
