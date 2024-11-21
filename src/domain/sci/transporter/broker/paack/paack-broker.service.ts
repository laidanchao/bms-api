import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import moment from 'moment';
import axios from 'axios';
import 'moment-timezone';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import { Transporter } from '@/domain/utils/Enums';
import { Logger } from '@/app/logger';
import * as cheerio from 'cheerio';
import { delay } from '@/domain/utils/util';

@Injectable()
export class PaackBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    return {
      trackingNumber: '',
      shippingNumber: '',
      label: '',
      labelFormat: '',
      labelUrl: '',
      transporterRequest: '',
      transporterResponse: '',
    };
  }

  async fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents) {
    const firstTrackingNumber = 'PAACK:' + trackingNumberPostCodeArray[0]?.trackingNumber;

    try {
      const trackingArray = [];
      console.time(firstTrackingNumber);

      console.log(`${firstTrackingNumber}等等${trackingNumberPostCodeArray.length}个单号开始爬取...`);
      for (const { trackingNumber, postCode } of trackingNumberPostCodeArray) {
        const result = await this.singleTrackingRequest(trackingNumber, postCode);
        trackingArray.push(...result);
        await delay(1000);
      }
      console.timeLog(firstTrackingNumber, `${firstTrackingNumber}等等,爬取结束!`);

      console.timeEnd(firstTrackingNumber);
      const result = await super.descMapHandle(Transporter.PAACK, trackingArray, cmsEvents, false);
      return {
        ...result,
        failedTrackingNumberArray: [],
      };
    } catch (e) {
      console.timeEnd(firstTrackingNumber);
      Logger.warn('PAACK tracking: ' + e.message);
      return {
        clearCache: true,
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
  }

  async singleTrackingRequest(trackingNumber: string, postCode: string) {
    const url = `https://mydeliveries.paack.app/tracking/order?tracking_number=${trackingNumber}&postal_code=${postCode}`;
    try {
      const response = await axios.request({
        url,
        method: 'get',
      });

      const rawTrackingArray = await this.getRawTrackingArray(response.data);
      return rawTrackingArray.map(rawTracking => {
        return {
          trackingNumber: trackingNumber,
          event: '',
          timestamp: moment(rawTracking.dateTime, 'DD MMMHH:mm').toDate(),
          description: rawTracking.desc,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn(`PAACK trackingNumber:${trackingNumber},${e.message}`);
      return [];
    }
  }

  private async getRawTrackingArray(data: string) {
    const $ = cheerio.load(data);
    const array = [];
    $('.order__timeline .tl-item').each(function() {
      const date = $(this)
        .find('.tl-item__date-text')
        .text();
      const time = $(this)
        .find('.typography--navy-blue-600')
        .eq(1)
        .text();
      const dateTime = date + time;
      const desc = $(this)
        .find('.typography--body2')
        .text();

      if (!date) {
        return true;
      }

      array.push({
        dateTime,
        desc,
      });
    });
    return array;
  }
}
