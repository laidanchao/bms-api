import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { WEBHOOK_SOURCE, Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BusinessException } from '@/app/exception/business-exception';
import crypto from 'crypto';
import { WebhookBaseDriver } from '@/domain/sct/webhook/drivers/webhook-base.driver';
import moment from 'moment';
import { Platform as Platform2 } from '@/domain/base/ssm/platform/entities/platform.entity';

@Injectable()
export class WebhookTrack17Driver extends WebhookBaseDriver {
  async build(body: any, headers: any) {
    const trackingNumber = body.data.number;
    const record = { webhookSource: WEBHOOK_SOURCE['17TRACK'], trackingNumber, body, headers };
    try {
      // 校验数据
      const parcel = await this.checkData(trackingNumber, body, headers['sign']);

      // 停止跟踪
      if (body.event === 'TRACKING_STOPPED') {
        await getRepository(Track17Request).update(
          {
            trackingNumber,
          },
          {
            stopAt: moment(),
            isStopped: true,
          },
        );

        return {
          data: {
            trackingNumber: trackingNumber,
            trackingArray: [],
            account: '',
            platform: '',
            parcel,
          },
          record,
        };
      } else {
        // 正常跟踪

        // 拼接轨迹
        const trackingArray = this.formatTrackingArray(trackingNumber, body.data.track_info, parcel.transporter);

        return {
          data: {
            trackingNumber,
            trackingArray,
            account: '',
            platform: '',
            parcel,
          },
          record,
        };
      }
    } catch (e) {
      throw new Error(JSON.stringify({ trackingNumber, account: '', message: e.message, record }));
    }
  }

  /**
   * 验证数据
   * @param trackingNumber
   * @param body
   * @param sign
   * @private
   */
  private async checkData(trackingNumber: string, body: any, sign: string) {
    const parcel = await getRepository(Parcel).findOne({
      where: { trackingNumber },
      order: { createdAt: 'DESC' },
    });
    if (!parcel) {
      throw new BusinessException(`包裹不存在,单号：${trackingNumber}`);
    }

    // 获取配置的apikey
    const { track17Key, track17Account } = await getRepository(Platform2).findOne({
      id: parcel.platform,
    });
    if (!track17Account) {
      throw new BusinessException(`未找到17track配置,单号：${trackingNumber},
      platform:${parcel.platform}`);
    }

    // 验证签名
    const str = `${JSON.stringify(body)}/${track17Key}`;
    // sha256加密
    const newSign = crypto
      .createHash('sha256')
      .update(str)
      .digest('hex');
    if (sign !== newSign) {
      throw new BusinessException(`签名有误,单号：${trackingNumber}`);
    }

    return parcel;
  }

  /**
   * 拼接tracking
   * @param trackingNumber
   * @param trackingInfo
   * @private
   */
  private formatTrackingArray(trackingNumber, trackingInfo, transporter) {
    const { misc_info, tracking } = trackingInfo;
    const reference = misc_info.reference_number;
    const trackingArray = [];
    for (const provider of tracking.providers) {
      const array = provider.events.map(m => {
        return Tracking.create({
          trackingNumber,
          reference,
          event: m.stage || '',
          timestamp: m.time_utc,
          description: m.description,
          location: m.location,
          transporter,
        });
      });

      trackingArray.push(...array);
    }

    return trackingArray;
  }
}
