import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import axios from 'axios';
import _ from 'lodash';
import { Logger } from '@/app/logger';
import moment from 'moment';

@Injectable()
export class BoyacaBroker extends TransporterBroker {
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
      for (const trackingNumberArrayChunk of _.chunk(trackingNumberArray, 100)) {
        const promises = trackingNumberArrayChunk.map(async trackingNumber => {
          const chunkTrackingArray = await this.singleTrackingRequest(trackingNumber);
          trackingArray.push(...chunkTrackingArray);
        });
        await Promise.all(promises);
      }
    } catch (e) {
      Logger.warn('BOYACA tracking: ' + e.message);
    }
    return trackingArray;
  }

  private async singleTrackingRequest(trackingNumber: any) {
    const url = `https://api.bdlastmile.com/graphql`;
    try {
      const { reference_number, type, packages, account } = (
        await axios.request({
          url,
          method: 'post',
          data: {
            query: this.getQueryStr(),
            operationName: 'GetShipmentForTracking',
            variables: {
              tracking_number: trackingNumber,
              account_id: 100,
            },
          },
        })
      ).data.data.getShipmentForTracking;

      return packages[0].packagesTracking.map(rawTracking => {
        const { event, description } = this.getEventAndDesc(type, rawTracking.status, account.shipmentStatusDescriptions);
        return {
          trackingNumber,
          reference: reference_number,
          event,
          description,
          timestamp: moment.tz(rawTracking.created_at, 'Europe/Paris').toDate(),
          location: rawTracking.address?.formatted_address || null,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn('BOYACA tracking: ' + e.message);
      return [];
    }
  }

  private getQueryStr() {
    return `
    query GetShipmentForTracking($tracking_number: String!, $account_id: ID!) {
      getShipmentForTracking(
        tracking_number: $tracking_number
        account_id: $account_id
      ) {
        id
        tracking_number
        reference_number
        status
        type
        packages {
          status
          packagesTracking {
            id
            status
            tracked
            address {
              id
              formatted_address
              geolocation_longitude
              geolocation_latitude
              __typename
            }
            created_at
            __typename
          }
          __typename
        }
        account {
          id
          shipmentStatusDescriptions {
            id
            type
            status
            description
            __typename
          }
          __typename
        }
        __typename
      }
    }
    `;
  }

  private getEventAndDesc(type: string, status: string, eventMap: { id, type, status, description }[]) {
    const event = eventMap.find(f => f.type === type && f.status === status);
    return {
      event: event?.id || `${type}_${status}`,
      description: event?.description || `${type}_${status}`,
    };
  }
}
