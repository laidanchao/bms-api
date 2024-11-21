import { Injectable } from '@nestjs/common';
import { TransporterBrokerFactory } from '@/domain/sci/transporter/broker/transporter-broker-factory';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { getRepository, In } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { CmsEventService } from '@/domain/sct/core/service/cms-event.service';
import _ from 'lodash';
import { CrawlerTargetManual, TARGET_MANUAL_STATUS } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { SiteType } from '@/domain/sct/core/dto/crawler-target-manual.dto';

@Injectable()
export class TrackingBrokerAdapter {
  constructor(
    private readonly transporterBrokerFactory: TransporterBrokerFactory,
    private readonly trackingHandlerService: TrackingHandlerService,
    private readonly cmsEventService: CmsEventService,
  ) {}

  async fetchTrackingByOSC(transporter: string, trackingNumberArray: Array<string>, accountInfo: any) {
    const client = this.transporterBrokerFactory.getBroker(transporter);
    if (transporter !== 'COLISSIMO') {
      return [];
    }
    return await client.fetchTrackingFromOSC({
      trackingNumberArray,
      accountInfo,
    });
  }

  async fetchTracking(
    transporter: string,
    trackingNumberPostCodeArray: { trackingNumber; postCode; shippingNumber }[],
    account: string,
    accountInfo: any,
    official: boolean,
  ): Promise<Tracking[]> {
    const trackingNumberArray = trackingNumberPostCodeArray.map(m => m.trackingNumber);
    const client = this.transporterBrokerFactory.getBroker(transporter);
    switch (transporter) {
      case 'CHRONOPOST':
      case 'COLICOLI':
      case 'CORREOS':
      case 'DHL':
      case 'DPD_CN':
      case 'FEDEX':
      case 'GLS':
      case 'UPS':
      case 'XBS':
      case 'ESPOST':
      case 'DPD':
      case 'SF':
      case 'AMAZON':
      case 'WELCO':
      case 'DISPEO':
      case 'GLS_V2': {
        /**
         * 测试结果
         * √ CHRONOPOST: 测试通过
         * × COLICOLI: 待测试
         * √ CORREOS: 测试通过
         * √ DHL: 测试通过
         * × DPD_CN: 未对接完成
         * √ FEDEX: 测试通过 仅测试了 15条
         * √ GLS: 测试通过
         * √ MR: 测试通过
         * √ UPS: 测试通过
         * √ XBS: 测试通过
         * √ WELCO: 测试通过
         */
        return await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
      }
      case 'BE': {
        if (official) {
          return await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
        } else {
          const cmsEvents = await this.cmsEventService.getCmsEventData();
          const result = await client.fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents);
          if (result.clearCache) {
            await this.cmsEventService.clearCache();
          }
          return result.trackingArray;
        }
      }
      case 'CAINIAO_V2': {
        return await client.fetchTrackingOfficial({ trackingNumberPostCodeArray, accountInfo });
      }
      case 'EXP': {
        /**
         * √ EXP: 测试通过
         */
        //TODO Exp派送商 不确定是否需要准确的包裹账号 目前只有一个账号 所以直接拿第一个账号

        // EXP 派送商需要传shippingNumber去查询轨迹
        const partOfParcelArray = await getRepository(Parcel).find({
          select: ['trackingNumber', 'shippingNumber'],
          where: {
            trackingNumber: In(trackingNumberArray),
          },
        });
        const shippingNumberArray = partOfParcelArray.map(parcel => parcel.shippingNumber);

        return await client.fetchTrackingOfficial({
          trackingNumberArray: shippingNumberArray,
          accountInfo,
        });
      }
      case 'MFB': {
        /**
         * 对于MFB，需要根据shippingNumber(order_id)+trackingNumber一起抓取包裹轨迹
         */
        const partOfParcelArray = await getRepository(Parcel).find({
          select: ['trackingNumber', 'shippingNumber'],
          where: {
            trackingNumber: In(trackingNumberArray),
          },
        });
        return await client.fetchTrackingOfficial({
          trackingNumberPostCodeArray: partOfParcelArray.map(parcel => ({ ...parcel, postCode: '' })),
          accountInfo,
        });
      }
      case 'ASENDIA':
      case 'DELIVENGO':
      case 'CTT':
      case 'BOYACA': {
        /**
         * 测试结果
         * √ ASENDIA: 测试通过
         * √ DELIVENGO: 测试通过
         */
        return await client.fetchTrackingUnofficial({ trackingNumberArray });
      }
      case 'COLISSIMO':
      case 'HKACE': {
        const result = await client.fetchTrackingUnofficial3({ trackingNumberArray });
        return result.trackingArray;
      }
      case 'CAINIAO': {
        if (official) {
          return await client.fetchTrackingOfficial({ trackingNumberPostCodeArray });
        } else {
          const result = await client.fetchTrackingUnofficial3({ trackingNumberArray });
          if (!_.isEmpty(result.failedTrackingNumberArray)) {
            const entities = result.failedTrackingNumberArray.map(trackingNumber => {
              return CrawlerTargetManual.create({
                trackingNumber: trackingNumber,
                shippingNumber: trackingNumber,
                transporter,
                transporterSite: SiteType.UNOFFICIAL_SITE,
                transporterAccountId: '',
                filePath: '',
                status: TARGET_MANUAL_STATUS.READY,
                receiverPostalCode: '',
                sort: 101,
              });
            });
            await getRepository(CrawlerTargetManual).save(entities);
          }
          return result.trackingArray;
        }
      }
      case 'MONDIAL_RELAY': {
        if (official) {
          return await client.fetchTrackingOfficial({ trackingNumberArray, accountInfo });
        } else {
          const cmsEvents = await this.cmsEventService.getCmsEventData();
          const result = await client.fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents);
          if (result.clearCache) {
            await this.cmsEventService.clearCache();
          }
          return result.trackingArray;
        }
      }
      case 'COLISPRIVE': {
        const cmsEvents = await this.cmsEventService.getCmsEventData();
        const result = await client.fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents);
        if (result.clearCache) {
          await this.cmsEventService.clearCache();
        }
        return result.trackingArray;
      }
      case 'CRONO': {
        const cmsEvents = await this.cmsEventService.getCmsEventData();
        const result = await client.fetchTrackingUnofficial2({ trackingNumberArray }, cmsEvents);
        if (result.clearCache) {
          await this.cmsEventService.clearCache();
        }
        return result.trackingArray;
      }
      case 'PAACK': {
        const cmsEvents = await this.cmsEventService.getCmsEventData();
        const result = await client.fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents);
        if (result.clearCache) {
          await this.cmsEventService.clearCache();
        }
        return result.trackingArray;
      }
      case 'GPX':
        const cmsEvents = await this.cmsEventService.getCmsEventData();
        const result = await client.fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents);
        if (result.clearCache) {
          await this.cmsEventService.clearCache();
        }
        return result.trackingArray;
      case 'GLS_ES':
        /**
         * × GLS_ES: 未对接完成
         */
        return [];
        break;
      default:
        return [];
    }
  }
}
