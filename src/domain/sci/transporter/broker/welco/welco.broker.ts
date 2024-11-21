import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import axios from 'axios';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterException } from '@/app/exception/transporter-exception';
import { Logger } from '@/app/logger';
import _ from 'lodash';
import moment from 'moment';

@Injectable()
export class WelcoBroker extends TransporterBroker {
  constructor() {
    super();
  }

  private TOKEN_INFO = { expireTime: '2023-01-01 00:00:00', token: '' };
  private baseUrl = process.env.NODE_ENV.includes('production')
    ? 'https://api.welco.io'
    : 'https://api.preprod.welco.io';
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { accountInfo, labelFormat, shipmentUrl } = channelConfig;
    let response: any;
    let transporterRequest: any;
    try {
      const access_token = await this.getAccessToken(accountInfo);
      const data = await this.buildData(shipment, channelConfig);
      transporterRequest = data;
      response = await this.shipments(shipmentUrl, access_token, data);
    } catch (e) {
      throw new TransporterException('WELCO', e.message, JSON.stringify(e.cmsTransporterRequest));
    }
    const { id, trackingNumber, label } = response.delivery;
    return {
      shippingNumber: id,
      trackingNumber,
      label,
      labelUrl: '',
      labelFormat: labelFormat.labelType,
      transporterRequest: JSON.stringify(transporterRequest),
      transporterResponse: JSON.stringify(response),
      reference: shipment.parcel.reference,
    };
  }

  /**
   * 拼装请求数据
   * @param shipment
   * @param channelConfig
   * @private
   */
  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const { senderAddress, receiverAddress, parcel } = shipment;
    const data = {
      service: channelConfig.productCode,
      customer: {
        name: TransporterUtils.getFullName(receiverAddress) || receiverAddress.company,
        email: receiverAddress.email,
        phone: receiverAddress.phoneNumber,
        address: {
          street: receiverAddress.street1 + receiverAddress.street2 + receiverAddress.street3,
          postalCode: receiverAddress.postalCode,
          city: receiverAddress.city,
          country: receiverAddress.countryCode,
        },
      },
      package: {
        dimensionUOM: 'CUBIC_CENTIMETER',
        weightUOM: 'KILOGRAM',
        weight: parcel.weight,
        width: parcel.width,
        height: parcel.height,
        length: parcel.length,
      },
      sender: {
        name: TransporterUtils.getFullName(senderAddress) || senderAddress.company,
        email: senderAddress.email,
        phone: senderAddress.phoneNumber,
        address: senderAddress.street1 + senderAddress.street2 + senderAddress.street3,
        zipCode: senderAddress.postalCode,
        city: senderAddress.city,
        countryCode: senderAddress.countryCode,
      },
      label: {
        type: channelConfig.labelFormat.value,
      },
    };

    return data;
  }

  /**
   * 根据账号信息获取accessTojen
   * @param accountInfo
   */
  private async getAccessToken(accountInfo) {
    if (moment().isBefore(this.TOKEN_INFO.expireTime)) {
      return this.TOKEN_INFO.token;
    }

    const { email, password } = accountInfo;
    const data = {
      email,
      password,
    };
    try {
      const response = await axios.request({
        baseURL: this.baseUrl,
        url: '/v2/external/login',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      });
      const token = response.data.jwt;
      this.TOKEN_INFO.token = token;
      this.TOKEN_INFO.expireTime = moment()
        .add(23, 'hours')
        .format();

      return token;
    } catch (e) {
      throw new TransporterException('', e.response.data.error_description || e.response.data);
    }
  }

  /**
   * 下单
   */
  private async shipments(shipmentUrl, access_token, data) {
    try {
      const response = await axios.request({
        baseURL: shipmentUrl,
        url: '/v2/external/delivery',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token,
        },
        data,
      });
      return response.data;
    } catch (e) {
      throw new TransporterException('', e.response.data.error?.comment || JSON.stringify(e.response.data), data);
    }
  }

  /**
   * 包裹取消
   * @param cancelParcel CancelParcelDto
   * @param channelConfig BaseConfig
   */
  async cancelShipment(cancelParcel: CancelParcelDto, channelConfig: BaseConfig) {
    const access_token = await this.getAccessToken(channelConfig.accountInfo);
    try {
      const response = await axios.request({
        baseURL: this.baseUrl,
        url: `/v2/external/delivery/${cancelParcel.shippingNumber}`,
        method: 'delete',
        headers: {
          Authorization: access_token,
        },
      });
      return response.data;
    } catch (e) {
      throw new TransporterException('', e.response.data.error_description);
    }
  }

  /**
   * Get traces by tracking number
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const access_token = await this.getAccessToken(accountInfo);

    const responseArray = [];
    for (const trackingNumberChunk of _.chunk(trackingNumberArray, 100)) {
      let chunkResponseArray = [];
      const promises = trackingNumberChunk.map(async trackingNumber => {
        try {
          const response = await axios.request({
            baseURL: this.baseUrl,
            url: `/v2/external/delivery/tracings/${trackingNumber}`,
            method: 'get',
            headers: {
              Authorization: access_token,
            },
          });
          chunkResponseArray = response.data.tracings.map(tracing => {
            return {
              trackingNumber: trackingNumber,
              reference: trackingNumber,
              event: tracing.type,
              timestamp: moment.utc(tracing.timestamp).toDate(),
              description: '',
              fromFile: false,
              location: null,
            };
          });
          responseArray.push(...chunkResponseArray);
        } catch (e) {
          Logger.warn('WELCO fetchTracking: ' + e.message);
        }
      });
      await Promise.all(promises);
    }
    return responseArray;
  }
}
