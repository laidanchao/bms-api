import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import Axios from 'axios';
import { TransporterException } from '@/app/exception/transporter-exception';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { Logger } from '@/app/logger';

@Injectable()
export class ColicoliBroker extends TransporterBroker {
  private running: boolean;

  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { receiverAddress, parcel, senderAddress, clientId } = shipment;
    const { apiToken } = channelConfig.accountInfo;
    const data = {
      city: receiverAddress.city,
      country: receiverAddress.countryCode,
      recipientName: TransporterUtils.getFullName(receiverAddress),
      phoneNumber: receiverAddress.phoneNumber,
      mobileNumber: receiverAddress.mobileNumber,
      province: receiverAddress.province,
      street1: receiverAddress.street1,
      street2: receiverAddress.street2,
      street3: receiverAddress.street3,
      zipCode: receiverAddress.postalCode,
      email: receiverAddress.email,
      reference: parcel.reference,
      senderName: TransporterUtils.getFullName(senderAddress),
      company: receiverAddress.company,
      senderPhoneNumber: senderAddress.phoneNumber,
      senderMobileNumber: senderAddress.mobileNumber,
      senderCity: senderAddress.city,
      senderCountry: senderAddress.countryCode,
      senderStreet1: senderAddress.street1,
      senderStreet2: senderAddress.street2,
      senderStreet3: senderAddress.street3,
      senderZipCode: senderAddress.postalCode,
      senderEmail: senderAddress.email,
      labelType: channelConfig.labelFormat.value,
      labelLogoUrl: shipment.options.labelLogoUrl, // 面单logo地址
      weight: parcel.weight,
      description: shipment.description,
      clientId: clientId,
      productType: channelConfig.productCode,
      trackingNumber: shipment.options?.trackingNumber || null,
      senderCompany: senderAddress.company,
    };
    const config: any = {
      method: 'POST',
      url: channelConfig.shipmentUrl,
      headers: {
        Authorization: apiToken,
        'Content-Type': 'application/json',
      },
      data: data,
      timeout: 10000,
    };
    try {
      const res = await Axios.request(config);
      if (res.data.code === 200) {
        const { data } = res;
        let labelBase64 = '';
        if (data.data?.labelUrl) {
          labelBase64 = await Axios.get(data.data.labelUrl, { responseType: 'arraybuffer' }).then(response =>
            Buffer.from(response.data, 'binary').toString('base64'),
          );
        }
        const result: CreateParcelResponse = {
          trackingNumber: data.data.trackingNumber,
          shippingNumber: data.data.trackingNumber,
          label: labelBase64,
          labelFormat: channelConfig.labelFormat.labelType,
          labelUrl: data.data?.labelUrl,
          transporterRequest: JSON.stringify(config),
          transporterResponse: JSON.stringify(data),
        };
        return result;
      } else if (ErrorCodeList.includes(res.data.errorCode)) {
        throw new TransporterException('', `${res.data.message}: ${res.data.errorCode}`, config);
      } else {
        throw new TransporterException('', res.data.message, config);
      }
    } catch (e) {
      throw new TransporterException('COLICOLI', e.message, config);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    // COLICOLI调用频率限制在一分钟1000个
    while (this.running) {
      await new Promise(resolve => setTimeout(resolve, 60 * 1000));
    }
    // 运行前将标记赋值为true
    this.running = true;

    const trackingArray = [];
    try {
      for (const trackingNumberArrayChunk of _.chunk(trackingNumberArray, 100)) {
        const promises = trackingNumberArrayChunk.map(async (trackingNumber, index) => {
          await new Promise(resolve => setTimeout(resolve, 50 * index));
          const chunkTrackingArray = await this.singleTrackingRequest(trackingNumber, accountInfo.apiToken);
          trackingArray.push(...chunkTrackingArray);
        });
        await Promise.all(promises);
      }
    } catch (e) {
      Logger.warn('COLICOLI tracking: ' + e.message);
    } finally {
      // 运行结束后将标记赋值为false
      this.running = false;
    }
    return trackingArray;
  }

  private async singleTrackingRequest(trackingNumber: any, token) {
    const stagingUrl = `http://colicoli-api.colicoli-staging/api/cc/tracking/getByTrackingNumber/${trackingNumber}`;
    const productionUrl = `http://colicoli-api.colicoli-production/api/tracking/getByTrackingNumber/${trackingNumber}`;
    try {
      const rawTrackingArray = (
        await axios.request({
          url: process.env.NODE_ENV === 'staging' ? stagingUrl : productionUrl,
          method: 'get',
          headers: {
            Authorization: token,
          },
        })
      ).data;
      return rawTrackingArray.map(rawTracking => {
        return {
          trackingNumber: rawTracking.trackingNumber,
          event: rawTracking.code || rawTracking.event,
          timestamp: moment.utc(rawTracking.timestamp).toDate(),
          description: rawTracking.zh,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn('COLICOLI tracking: ' + e.message);
      return [];
    }
  }
}

export const ErrorCodeList = ['OMS_001_LIMIT', 'OMS_002_ZIPCODE'];
