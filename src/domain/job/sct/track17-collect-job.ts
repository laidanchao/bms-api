import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import _ from 'lodash';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import moment from 'moment';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';
import { RegisterStatus, Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 收集需要注册的物流单号
 */
@Injectable()
export class Track17CollectJob extends NormalJob {
  constructor(private xPushService: XPushService) {
    super();
  }

  async handle(options): Promise<any> {
    try {
      const configs = await getRepository(Track17).find({ enabled: true });

      // 12小时1分钟前(收集近12小时的符合条件的包裹)
      const Hour12Minute1Ago = moment()
        .subtract(12, 'hours')
        .subtract(1, 'minutes')
        .format();
      const startTime = options?.startTime || Hour12Minute1Ago;
      await this.xPushService.sendDingDing(`Track17CollectJob 开始收集,startTime:${startTime}`, 'tracking');
      let collectCount = 0;
      for (const { platform, transporterId, transporterAccounts } of configs) {
        // 拼接sql
        let sqlWhere = `parcel.platform = '${platform}' and parcel.transporter = '${transporterId}'`;
        if (!_.isEmpty(transporterAccounts)) {
          const accounts = transporterAccounts.map(m => `'${m}'`).toString();
          sqlWhere += ` and parcel.transporterAccountId in (${accounts})`;
        } else {
          sqlWhere += ` and parcel.transporterAccountId != 'EXTERNAL_ACCOUNT'`;
        }

        // 获取未注册，未签收，有配置的包裹单号
        const parcels = await getRepository(Parcel)
          .createQueryBuilder('parcel')
          .leftJoin(Transporter, 'transporter', 'transporter.id = parcel.transporter')
          .leftJoin(Track17Request, 'record', 'parcel.trackingNumber = record.trackingNumber')
          .andWhere('record.trackingNumber is null') // 未注册的
          .andWhere('(parcel.isArrived is null or parcel.isArrived = false)')
          .andWhere('parcel.createdAt > :startTime', { startTime })
          .andWhere(sqlWhere)
          .select('parcel.trackingNumber', 'trackingNumber')
          .addSelect('parcel.platform', 'platform')
          .addSelect('parcel.receiverPostalCode', 'receiverPostalCode')
          .addSelect('transporter.carrierCode17track', 'carrierCode')
          .getRawMany();

        const entities = parcels.map(m => {
          return Track17Request.create({
            trackingNumber: m.trackingNumber,
            isStopped: false,
            registerStatus: RegisterStatus.READY,
            registerCount: 0,
            platform: m.platform,
            receiverPostalCode: m.receiverPostalCode,
            carrierCode17track: m.carrierCode || this.getCarrierCode(m.trackingNumber),
          });
        });

        collectCount += entities.length;
        await getRepository(Track17Request).save(entities, { chunk: 100 });
      }

      await this.xPushService.sendDingDing(`Track17CollectJob 收集完毕，共${collectCount}条`, 'tracking');
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService
        .sendDingDing(`Track17CollectJob 出现异常，异常信息: ${e.message}|${e.stack}`, 'tracking')
        .then();
    }
  }

  private getCarrierCode(trackingNumber: string) {
    // CNFR开头的单号是菜鸟的
    if (trackingNumber.startsWith('CNFR')) {
      return '190271';
    } else {
      return null;
    }
  }
}
