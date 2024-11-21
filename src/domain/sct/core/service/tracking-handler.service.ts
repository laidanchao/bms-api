import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@/app/logger';
import { EventService } from '@/domain/sct/core/service/event.service';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { Moment } from '@softbrains/common-utils';
import _ from 'lodash';
import { ParcelStatus } from '@/domain/utils/Enums';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Injectable()
export class TrackingHandlerService {
  @Inject()
  private trackingEventService: EventService;

  @Inject()
  private xPushService: XPushService;

  public async handleTrackingEventList(trackingList: any[], transporter) {
    try {
      const trackingEvents = [];
      for (const tracking of trackingList) {
        const trackingEvent = await this.findTrackingEvent(tracking, transporter);
        if (trackingEvent) {
          trackingEvents.push(trackingEvent);
          if (trackingEvent.parcelStatus === ParcelStatus.UNKNOWN) {
            const message = `没有为轨迹事件 ${trackingEvent.event} 指定包裹状态。单号${tracking.trackingNumber},派送商${transporter}`;
            Logger.warn(message);
            this.xPushService.sendDingDing(message, 'tracking').then();
          }
        }
      }
      return trackingEvents;
    } catch (err) {
      throw new Error(err + 'handle tracking event error.');
    }
  }

  public async findTrackingEvent(tracking, transporter) {
    // // 法邮空event额外逻辑：event为NULL-${type} 若event和type都为空，那event为空
    // if (transporter === 'COLISSIMO' && !tracking.event) {
    //   tracking.event = tracking.type ? `NULL-${tracking.type}` : tracking.event;
    // }
    const trackingEvent = await this.trackingEventService.findByEventAndTransporterNew(tracking.event, transporter);
    if (!trackingEvent && tracking.event) {
      return await this._saveUnrecordedTrackingEvent(tracking, transporter);
    }
    return trackingEvent;
  }

  private async _saveUnrecordedTrackingEvent(tracking, transporter) {
    const [trackingEvent] = await this.trackingEventService.saveUnresolvedTrackingEvents([tracking], transporter);

    const message = `出现一条未入库的轨迹事件${tracking.event}:${tracking.description}。单号${tracking.trackingNumber},供应商${transporter}`;
    this.xPushService.sendDingDing(message, 'tracking').then();

    return trackingEvent;
  }

  public async getTrackingEvents(events, transporter) {
    try {
      let trackingEvents = [];
      for (const event of events) {
        const trackingEventList = await this.trackingEventService.findByEventAndTransporter(event, transporter);
        trackingEvents = _.concat(trackingEvents, trackingEventList);
      }
      return trackingEvents;
    } catch (e) {
      Logger.error(e);
      throw new Error('get tracking event error.');
    }
  }

  /**
   * 轨迹排序
   * 获取到的同一秒内的轨迹，把arrived的轨迹排在后方
   * @param transporter
   * @param trackingArray
   */
  public async handleTrackingSort(transporter, trackingArray: any[]) {
    const trackingEvents = await this.getTrackingEvents(_.map(trackingArray, 'event'), transporter);
    return trackingSort(transporter, trackingArray, trackingEvents);
  }
}

export function trackingSort(transporter, trackingArray: any[], trackingEvents, orderType = 'asc') {
  // todo danchao 暂时不处理trackingEvent没有的轨迹排序
  const filterTrackingEvents = trackingEvents.filter(e => !!e?.event);
  return trackingArray.sort((a, b) => {
    if (a.timestamp === b.timestamp || Moment(a.timestamp).isSame(b.timestamp)) {
      const a_status =
        _.find(filterTrackingEvents, v => v.event === a.event && v.transporter === transporter)?.parcelStatus || '';
      const b_status =
        _.find(filterTrackingEvents, v => v.event === b.event && v.transporter === transporter)?.parcelStatus || '';
      if (a_status === 'ARRIVED') {
        return orderType === 'asc' ? 1 : -1;
      } else {
        return orderType === 'asc' ? -1 : 1;
      }
    } else {
      if (orderType === 'asc') {
        return a.timestamp > b.timestamp ? 1 : -1;
      } else {
        return a.timestamp > b.timestamp ? -1 : 1;
      }
    }
  });
}
