import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import axios from 'axios';
import _ from 'lodash';
import { Logger } from '@/app/logger';

@Injectable()
export class CttBroker extends TransporterBroker {
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

  async fetchTrackingUnofficial({ trackingNumberArray }) {
    const trackingArray = [];
    try {
      for (const trackingNumberArrayChunk of _.chunk(trackingNumberArray, 50)) {
        const promises = trackingNumberArrayChunk.map(async trackingNumber => {
          const chunkTrackingArray = await this.singleTrackingRequest(trackingNumber);
          trackingArray.push(...chunkTrackingArray);
        });
        await Promise.all(promises);
      }
    } catch (e) {
      Logger.warn('CTT tracking: ' + e.message);
    }
    return trackingArray;
  }

  private async singleTrackingRequest(trackingNumber: any) {
    const subTrackingNumber = trackingNumber.substr(0, 22);
    const url = `https://wct.cttexpress.com/p_track_redis.php?sc=${subTrackingNumber}`;
    try {
      const rawTrackingArray = (
        await axios.request({
          url,
          method: 'get',
        })
      ).data.data;

      return rawTrackingArray.shipping_history.events
        .filter(f => f.type === 'STATUS')
        .map(rawTracking => {
          return {
            trackingNumber: trackingNumber,
            event: rawTracking.code,
            timestamp: rawTracking.event_date,
            description: rawTracking.description,
            fromFile: false,
          };
        });
    } catch (e) {
      Logger.warn(`CTT trackingNumber:${trackingNumber},${e.message}`);
      return [];
    }
  }
}
