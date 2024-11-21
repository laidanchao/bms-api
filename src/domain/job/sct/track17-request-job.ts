import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { Between, getRepository, In, LessThan, MoreThan } from 'typeorm';
import _ from 'lodash';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';
import { RegisterStatus, Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';
import { Track17Util } from '@/domain/sct/webhook/utils/track17.utils';
import { BusinessException } from '@/app/exception/business-exception';
import moment from 'moment/moment';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { LastmileProvider } from '@/domain/utils/Enums';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';

/**
 * 注册物流单号
 */
@Injectable()
export class Track17RequestJob extends NormalJob {
  constructor(private xPushService: XPushService) {
    super();
  }

  async handle(options): Promise<any> {
    let startDate;
    let endDate;
    if (options?.startDate && options?.endDate) {
      startDate = options.startDate;
      endDate = options.endDate;
    } else {
      endDate = moment().format();
      startDate = moment(endDate)
        .subtract('7', 'day')
        .format();
    }

    try {
      const configs = await getRepository(Track17).find({ enabled: true });
      const platformIds = configs.map(m => m.platform);
      const platforms = await getRepository(Platform).find({
        id: In(platformIds),
      });

      const track17Requests = await getRepository(Track17Request).find({
        where: {
          registerStatus: In([RegisterStatus.READY, RegisterStatus.FAILED]),
          registerCount: LessThan(10),
          createdAt: Between(startDate, endDate),
        },
        take: 10000,
      });

      const trackingNumbers = track17Requests.map(m => m.trackingNumber);
      const date = moment()
        .subtract(3, 'month')
        .format('YYYY-MM-DD');
      const parcels = await getRepository(Parcel).find({
        where: {
          trackingNumber: In(trackingNumbers),
          createdAt: MoreThan(date),
        },
      });

      for (const { id, track17Key } of platforms) {
        const requests = track17Requests.filter(f => f.platform === id);
        await this.registerTrackingNumber(requests, track17Key, parcels);
      }
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService
        .sendDingDing(`Track17RequestJob 出现异常，异常信息: ${e.message}|${e.stack}`, 'tracking')
        .then();
    }
  }

  /**
   * 注册物流单号
   * @param requests
   * @param key
   * @private
   */
  private async registerTrackingNumber(requests: any[], key, parcels: Parcel[]) {
    for (const chunkRequests of _.chunk(requests, 40)) {
      // 注册单号
      const { code, data } = await Track17Util.register(
        chunkRequests.map(m => {
          const parcel = parcels.find(f => f.trackingNumber === m.trackingNumber);
          // fedex不传额外参数
          if (parcel?.lastmileProvider === LastmileProvider.FEDEX) {
            return _.pick(m, ['trackingNumber', 'carrierCode17track']);
          } else {
            return _.pick(m, ['trackingNumber', 'carrierCode17track', 'receiverPostalCode']);
          }
        }),
        key,
      );
      if (code !== 0) {
        throw new BusinessException(`注册物流单号失败，错误代码：${code}`);
      }
      const successData = data.accepted;
      const failedData = data.rejected;
      const failedMap = _.mapKeys(failedData, 'number');

      chunkRequests.forEach(f => {
        f.registerCount = f.registerCount + 1;
        if (_.some(successData, s => s.number === f.trackingNumber)) {
          f.registerStatus = RegisterStatus.SUCCESS;
        } else {
          f.registerStatus = RegisterStatus.FAILED;
          f.registerFailedReason = failedMap[f.trackingNumber]?.error.message;
        }
      });

      await getRepository(Track17Request).save(chunkRequests);
    }
  }
}
