import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import 'moment-timezone';
import _ from 'lodash';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment';
import crypto from 'crypto';
import { Logger } from '@/app/logger';
import { getRepository } from 'typeorm';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';

@Injectable()
export class EspostBroker extends TransporterBroker {
  constructor() {
    super();
  }

  /**
   * Get label
   */
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { accountInfo, productCode, labelFormat, shipmentUrl } = channelConfig;
    const { senderAddress, receiverAddress, parcel } = shipment;
    const randomNum = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    const reference = parcel.reference || `REF_${new Date().getTime().toString()}_${randomNum}`;
    const goods = _.map(parcel.items, good => {
      return {
        name: '',
        name_en: '',
        sku: '',
        unit_price: good.value,
        quantity: good.quantity,
        unit_weight: good.weight,
        hscode: good.hsCode,
        material: '',
        usage: '',
        length: '',
        width: good.weight,
        height: '',
        brand: '',
        origin: good.originCountry,
        photos: '',
        sale_price: '0.00',
        sale_url: '',
        description: good.description,
        attr: '',
      };
    });
    const data = {
      client_ref: reference,
      line_code: productCode,
      vat_number: '',
      eori: senderAddress.eori,
      ref1: reference,
      ref2: reference,
      remark: shipment.description,
      cash: 0,
      insure_amount: parcel.insuranceValue,
      packages: [
        {
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          weight: parcel.weight,
          goods,
        },
      ],
      sender: {
        name: TransporterUtils.getFullName(senderAddress),
        company: senderAddress.company,
        phone: senderAddress.phoneNumber,
        country_code: senderAddress.countryCode,
        province: senderAddress.province,
        city: senderAddress.city,
        post_code: senderAddress.postalCode,
        address1: senderAddress.street1,
        address2: `${senderAddress.street2 || ''}${senderAddress.street3 || ''}`,
        email: senderAddress.email,
      },
      consignee: {
        name: TransporterUtils.getFullName(receiverAddress),
        company: receiverAddress.company,
        phone: receiverAddress.phoneNumber,
        country_code: receiverAddress.countryCode,
        province: receiverAddress.province,
        city: receiverAddress.city,
        post_code: receiverAddress.postalCode,
        address1: receiverAddress.street1,
        address2: `${receiverAddress.street2 || ''}${receiverAddress.street3 || ''}`,
        email: receiverAddress.email,
      },
    };

    const token = await this.getToken(shipmentUrl, accountInfo.pk, accountInfo.sk);
    let response: any;
    const requestConfig: AxiosRequestConfig = {
      url: `${channelConfig.shipmentUrl}/openApi/v2/shipments/create`,
      method: 'post',
      headers: {
        'BC-TOKEN': token,
      },
      data,
      timeout: 10000,
    };
    try {
      response = await axios.request(requestConfig);
      if (response.data.code !== 0) {
        throw new TransporterException('', response.data.msg, data);
      }
    } catch (e) {
      throw new TransporterException('ESPOST', e.message, data);
    }
    const label = await this._transformerBase64(response.data.data.packages[0].label);
    return {
      trackingNumber: response.data.data.packages[0].tracking_number,
      shippingNumber: response.data.data.shipments_id,
      label: label,
      labelUrl: response.data.data.packages[0].label,
      lastmileProviderMapKey: response.data.data.server,
      labelFormat: labelFormat.labelType,
      transporterRequest: JSON.stringify(data),
      transporterResponse: JSON.stringify(response.data),
    };
  }

  /**
   * Get traces by tracking number
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const responseArray = [];
    const transporterApi = await getRepository(TransporterApi).findOne({
      transporter: 'ESPOST',
      enabled: true,
    });
    const shipmentUrl = transporterApi?.apiUrl;
    for (const trackingNumberChunk of _.chunk(trackingNumberArray, 100)) {
      let chunkResponseArray = [];
      const promises = trackingNumberChunk.map(async trackingNumber => {
        const data = {
          tracking_number: trackingNumber,
        };
        try {
          const token = await this.getToken(shipmentUrl, accountInfo.pk, accountInfo.sk);
          const response = await axios.request({
            url: `${shipmentUrl}/openApi/v2/tracking`,
            method: 'post',
            headers: {
              'BC-TOKEN': token,
            },
            data,
          });
          if (response.data.code === 0) {
            chunkResponseArray = response.data.data.events.map(event => {
              return {
                trackingNumber: trackingNumber,
                reference: trackingNumber,
                event: event.description,
                timestamp: moment
                  .unix(event.timestamp)
                  .utc()
                  .toDate(),
                description: event.description,
                fromFile: false,
                location: event.location,
              };
            });
            responseArray.push(...chunkResponseArray);
          }
        } catch (e) {
          Logger.warn('Espost fetchTracking: ' + e.message);
        }
      });
      await Promise.all(promises);
    }
    return responseArray;
  }

  /**
   * 获取授权token
   * @param shipmentUrl
   */
  async getToken(shipmentUrl, pk, sk) {
    const timestamp = moment().unix();
    const random16 = this.generateRandom16();
    const sign = crypto
      .createHash('md5')
      .update(`${pk},${timestamp},${sk},${random16}`)
      .digest('hex')
      .toLowerCase();
    const response = await axios.request({
      url: `${shipmentUrl}/openApi/v2/auth`,
      method: 'post',
      data: {
        pk,
        onceStr: random16,
        timestamp,
        sign,
      },
    });
    if (response.data.code !== 0) {
      throw new TransporterException('Espost', response.data.msg);
    }
    return response.data.data.bc_token;
  }

  generateRandom16() {
    const randomNum = Math.floor(Math.random() * 10000000000000000);
    return randomNum.toString().padStart(16, '0');
  }

  async _transformerBase64(url) {
    const data = await this._getLabel(url);
    try {
      const result = data.toString('base64');
      return result;
    } catch (e) {
      throw new Error('Error during PDF combination: ' + e.message);
    }
  }

  async _getLabel(url) {
    // get label from expost
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
    });

    return response.data;
  }
}
