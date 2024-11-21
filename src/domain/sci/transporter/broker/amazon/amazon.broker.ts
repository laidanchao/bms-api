import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import axios from 'axios';
import qs from 'qs';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterException } from '@/app/exception/transporter-exception';
import { getRepository } from 'typeorm';
import { Logger } from '@/app/logger';
import _ from 'lodash';
import aws4 from 'aws4';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';
import { delay } from '@/domain/utils/util';

@Injectable()
export class AmazonBroker extends TransporterBroker {
  constructor() {
    super();
  }
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { accountInfo, labelFormat, shipmentUrl } = channelConfig;
    // 获取access_token
    let response: any;
    let transporterRequest: any;
    const randomNum = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    shipment.parcel.reference = shipment.parcel.reference || `REF_${new Date().getTime().toString()}_${randomNum}`;
    try {
      const access_token = await this.getAccessToken(accountInfo);
      // 获取 requestToken 和 rateId
      const { requestToken, rateId, labelType, data } = await this.getRateId(shipment, channelConfig, access_token);
      transporterRequest = data;
      // 获取面单
      response = await this.shipments(shipmentUrl, access_token, requestToken, rateId, accountInfo, labelType);
    } catch (e) {
      throw new TransporterException('AMAZON', e.message, e.cmsTransporterRequest);
    }
    const { shipmentId, packageDocumentDetails } = response.payload;
    return {
      shippingNumber: shipmentId,
      trackingNumber: packageDocumentDetails[0].trackingId,
      label: packageDocumentDetails[0].packageDocuments[0].contents,
      labelUrl: '',
      labelFormat: labelFormat.labelType,
      transporterRequest: JSON.stringify(transporterRequest),
      transporterResponse: JSON.stringify(response),
      reference: shipment.parcel.reference,
    };
  }

  /**
   * 根据订单信息获取 rateId 和 requestToken
   * @param shipment
   * @param channelConfig
   * @param access_token
   */
  async getRateId(shipment, channelConfig, access_token) {
    const { accountInfo, productCode, labelFormat, shipmentUrl } = channelConfig;
    const { senderAddress, receiverAddress, parcel } = shipment;
    const items = parcel.items.map(item => {
      return {
        quantity: item.quantity,
        itemIdentifier: item.hsCode,
        description: item.description,
        isHazmat: false,
        itemValue: {
          unit: 'EUR',
          value: item.value,
        },
        productType: item.category,
        weight: {
          unit: 'KILOGRAM',
          value: item.weight,
        },
      };
    });
    const data = {
      shipFrom: {
        name: TransporterUtils.getFullName(senderAddress) || senderAddress.company,
        addressLine1: senderAddress.street1,
        addressLine2: senderAddress.street2,
        addressLine3: senderAddress.street3,
        companyName: senderAddress.company,
        stateOrRegion: senderAddress.province,
        postalCode: senderAddress.postalCode,
        city: senderAddress.city,
        countryCode: senderAddress.countryCode,
        email: senderAddress.email,
        phoneNumber: senderAddress.phoneNumber,
      },
      shipTo: {
        name: TransporterUtils.getFullName(receiverAddress) || receiverAddress.company,
        addressLine1: receiverAddress.street1,
        addressLine2: receiverAddress.street2,
        addressLine3: receiverAddress.street3,
        companyName: receiverAddress.company,
        stateOrRegion: receiverAddress.province,
        postalCode: receiverAddress.postalCode,
        city: receiverAddress.city,
        countryCode: receiverAddress.countryCode,
        email: receiverAddress.email,
        phoneNumber: receiverAddress.phoneNumber,
      },
      packages: [
        {
          dimensions: {
            length: parcel.length,
            width: parcel.width,
            height: parcel.height,
            unit: 'CENTIMETER',
          },
          weight: {
            unit: 'KILOGRAM',
            value: parcel.weight,
          },
          insuredValue: {
            unit: 'EUR',
            value: parcel.insuranceValue,
          },
          items,
          packageClientReferenceId: shipment.parcel.reference,
        },
      ],
      channelDetails: {
        channelType: 'EXTERNAL',
      },
    };
    // 派送商要求可不传，但传值不能为空
    if (!senderAddress.street2) {
      delete data.shipFrom.addressLine2;
    }
    if (!senderAddress.street3) {
      delete data.shipFrom.addressLine3;
    }
    if (!receiverAddress.street2) {
      delete data.shipTo.addressLine2;
    }
    if (!receiverAddress.street3) {
      delete data.shipTo.addressLine3;
    }
    const path = '/shipping/v2/shipments/rates';
    const authorizationHeader = this.getAwsAuthorization(accountInfo, shipmentUrl, path);
    try {
      const response = await axios.request({
        url: `${shipmentUrl}${path}`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-access-token': access_token,
          'x-amzn-shipping-business-id': accountInfo.businessId,
          ...authorizationHeader,
        },
        data: JSON.stringify(data),
      });
      const { rates, requestToken, ineligibleRates } = response.data.payload;
      if (_.isEmpty(rates)) {
        throw new Error(ineligibleRates[0]?.ineligibilityReasons[0]?.message || '');
      }
      const rateService = _.find(rates, rate => rate.serviceId === productCode);
      const labelType = _.find(
        rateService.supportedDocumentSpecifications,
        doc => doc.format === labelFormat.labelType,
      );
      return {
        requestToken: requestToken,
        rateId: rateService.rateId,
        labelType,
        data,
      };
    } catch (e) {
      throw new TransporterException('', e.response?.data?.errors[0]?.details || e.message, data);
    }
  }

  /**
   * 最后一步获取trackingNumber
   */
  async shipments(shipmentUrl, access_token, requestToken, rateId, accountInfo, labelType) {
    try {
      const path = '/shipping/v2/shipments';
      const authorizationHeader = this.getAwsAuthorization(accountInfo, shipmentUrl, path);
      const response = await axios.request({
        url: `${shipmentUrl}${path}`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-access-token': access_token,
          'x-amzn-shipping-business-id': accountInfo.businessId,
          ...authorizationHeader,
        },
        data: {
          requestToken,
          rateId,
          requestedDocumentSpecification: {
            format: labelType.format,
            size: labelType.size,
            dpi: 203,
            pageLayout: 'DEFAULT',
            needFileJoining: false,
            requestedDocumentTypes: ['LABEL'],
          },
        },
      });
      return response.data;
    } catch (e) {
      throw new TransporterException('', e.response?.data?.error_description || e.message);
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
        url: `${channelConfig.shipmentUrl}/shipping/v2/shipments/${cancelParcel.shippingNumber}/cancel`,
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-access-token': access_token,
        },
      });
      return response.data;
    } catch (e) {
      throw new TransporterException('AMAZON', e);
    }
  }

  /**
   * Get traces by tracking number
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const responseArray = [];
    const transporterApi = await getRepository(TransporterApi).findOne({
      transporter: 'AMAZON',
      enabled: true,
    });
    const shipmentUrl = transporterApi?.apiUrl;
    for (const trackingNumberChunk of _.chunk(trackingNumberArray, 20)) {
      let chunkResponseArray = [];
      const promises = trackingNumberChunk.map(async trackingNumber => {
        try {
          const access_token = await this.getAccessToken(accountInfo);
          const response = await axios.request({
            url: `${shipmentUrl}/shipping/v2/tracking?carrierId=${accountInfo.carrierId}&trackingId=${trackingNumber}`,
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'x-amz-access-token': access_token,
            },
          });
          chunkResponseArray = response.data.payload.eventHistory.map(event => {
            return {
              trackingNumber: trackingNumber,
              reference: trackingNumber,
              event: event.eventCode,
              timestamp: event.eventTime,
              description: event.eventCode,
              fromFile: false,
              location: event.location?.stateOrRegion,
            };
          });
          responseArray.push(...chunkResponseArray);
        } catch (e) {
          Logger.warn('AMAZON fetchTracking: ' + e.message);
        }
      });
      await Promise.all(promises);
      await delay(1000);
    }
    return responseArray;
  }

  /**
   * 根据账号信息获取accessTojen
   * @param accountInfo
   */
  async getAccessToken(accountInfo) {
    const { refresh_token, client_id, client_secret } = accountInfo;
    const data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token,
      client_id,
      client_secret,
    });
    try {
      const response = await axios.request({
        url: 'https://api.amazon.co.uk/auth/o2/token',
        method: 'post',
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      });
      return response.data.access_token;
    } catch (e) {
      throw new TransporterException('', e.response.data.error_description);
    }
  }

  /**
   * 获取aws header 权限信息
   * @param accountInfo
   * @param shipmentUrl
   * @param path
   */
  getAwsAuthorization(accountInfo, shipmentUrl, path) {
    const { accessKey, secretKey } = accountInfo;
    const signedRequest = aws4.sign(
      {
        host: shipmentUrl.replace(/^https?:\/\//, ''),
        path,
        service: 'execute-api',
        region: 'us-east-1',
        headers: {},
      },
      {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    );
    return signedRequest.headers;
  }
}
