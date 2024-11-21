import { WebhookBaseDriver } from './webhook-base.driver';
import { WEBHOOK_SOURCE } from '../entity/track17-request.entity';
import { WebhookColissimoDriver } from './webhook-colissimo.driver';
import { WebhookTrack17Driver } from './webhook-track17.driver';
import { BusinessException } from '@/app/exception/business-exception';
import { WebhookDelivengoDriver } from '@/domain/sct/webhook/drivers/webhook-delivengo.driver';
import { WebhookColicoliDriver } from './webhook-colicoli.driver';
import { WebhookCainiaoDriver } from '@/domain/sct/webhook/drivers/webhook-cainiao.driver';

export class DriverFactory {
  static getDriver(platform: WEBHOOK_SOURCE) {
    let driver: WebhookBaseDriver;
    switch (platform) {
      case WEBHOOK_SOURCE.COLISSIMO:
        driver = new WebhookColissimoDriver();
        break;
      case WEBHOOK_SOURCE.DELIVENGO:
        driver = new WebhookDelivengoDriver();
        break;
      case WEBHOOK_SOURCE['17TRACK']:
        driver = new WebhookTrack17Driver();
        break;
      case WEBHOOK_SOURCE.COLICOLI:
        driver = new WebhookColicoliDriver();
        break;
      case WEBHOOK_SOURCE.CAINIAO:
        driver = new WebhookCainiaoDriver();
        break;
      default:
        throw new BusinessException(`${platform}webhook驱动不存在`);
    }
    return driver;
  }
}
