export class CrawlerPlanCreateDTO {
  trackingNumbers: Array<string>;
  transporter: string;
  schedule: Date;
  maxTimes?: number = 3;
  automatic?: boolean = false;
  platform: string;
  trackAimStatus: string;
  official: boolean;
}
