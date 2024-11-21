import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import axios, { AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import { GPXOption } from '@/domain/sci/transporter/broker/gpx/gpx.option';
import { Logger } from '@/app/logger';
import { GeneratorInvoicePdf } from '../common/generate-invoice-pdf';
import { delay } from '@/domain/utils/util';
import { Transporter } from '@/domain/utils/Enums';
import * as cheerio from 'cheerio';

export class GpxBroker extends TransporterBroker {
  private BaseUrl = process.env.NODE_ENV.includes('production')
    ? 'https://odoo.gpxlogistique.com'
    : 'https://dev02.rika.sudokeys.com';

  private Token;

  /**
   * 下单
   * 官方文档：https://sudokeys.docs.sudokeys.com/doc-gpx-ws/
   * @param shipment
   * @param channelConfig
   */
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    let data = {};
    try {
      // 1. 获取token
      await this.getToken(channelConfig.accountInfo.authKey);
      // 2. 下预订单
      data = this.buildData(shipment, channelConfig.productCode);
      const reference = await this.preShipment(channelConfig.shipmentUrl, data);

      let invoiceBase64 = '';
      // 邮寄非文件物品时，需要上传发票
      if (channelConfig.productCode === 'nd') {
        // 3. 上传发票
        invoiceBase64 = GeneratorInvoicePdf.generator(shipment, channelConfig);
        const options = <GPXOption>shipment.options;
        await this.uploadInvoice(reference, invoiceBase64, options.invoiceNumber, options.invoiceDate);
      }

      // 4. 确认下单
      const trackingNumber = await this.confirmation(reference);
      // 5. 获取面单
      const label = await this.getLabel({ trackingNumber });

      return {
        trackingNumber,
        shippingNumber: reference,
        label,
        invoice: invoiceBase64,
        labelFormat: channelConfig.labelFormat.labelType,
        reference: shipment.parcel.reference,
        transporterRequest: JSON.stringify(data),
        transporterResponse: label,
      };
    } catch (e) {
      const error = e?.message || JSON.stringify(e);
      console.error(e);
      throw new TransporterException('GPX', error, data);
    }
  }

  /**
   * 获取token
   * @private
   */
  private async getToken(authKey: string) {
    try {
      const [data] = await this.request('POST', `${this.BaseUrl}/gpx_ws/get_token`, null, {
        params: {
          auth_key: authKey,
        },
      });

      this.Token = data[1];
    } catch (e) {
      Logger.error(`GPX获取token失败：${e}`);
      throw new Error('获取token失败：' + e.message);
    }
  }

  /**
   * 拼接包裹信息
   * @param shipment
   * @param productCode
   * @private
   */
  private buildData(shipment: CreateClientDto, productCode: string | number) {
    const { senderAddress, receiverAddress } = shipment;
    const shipmentOption = <GPXOption>shipment.options;
    const senderIsCompany = !!shipment.senderAddress.company;
    const receiverIsCompany = !!shipment.receiverAddress.company;

    const body = {
      params: {
        customer_ref: shipment.parcel.reference || null,
        removal: 'gpx',
        removal_date: moment(shipmentOption.removalDate).format('YYYY-MM-DD'),
        removal_time: moment(shipmentOption.removalDate).format('a') === 'pm' ? 'aft' : 'mor',
        term: 1,
        not_danger: true,
        not_lithium: true,
        transaction: 11,
        sender: {
          company: senderIsCompany,
          contact: senderIsCompany ? senderAddress.company : null,
          siret: senderIsCompany && senderAddress?.siret ? senderAddress.siret : null,
          name: TransporterUtils.getFullName(senderAddress),
          street: (senderAddress.street1 || '') + (senderAddress.street2 || '') + (senderAddress.street3 || ''),
          zip: senderAddress.postalCode,
          city: senderAddress.city,
          country: senderAddress.countryCode,
          phone: senderAddress.phoneNumber,
          mobile: senderAddress.mobileNumber,
          email: senderAddress.email,
        },
        receiver: {
          company: receiverIsCompany,
          contact: receiverIsCompany ? receiverAddress.company : null,
          siret: receiverIsCompany && receiverAddress?.siret ? receiverAddress.siret : null,
          name: TransporterUtils.getFullName(receiverAddress),
          street: (receiverAddress.street1 || '') + (receiverAddress.street2 || '') + (receiverAddress.street3 || ''),
          zip: receiverAddress.postalCode,
          city: receiverAddress.city,
          country: receiverAddress.countryCode,
          phone: receiverAddress.phoneNumber,
          mobile: receiverAddress.mobileNumber,
          email: receiverAddress.email,
        },
        pieces: [shipment.parcel].map(v => {
          return {
            type: productCode,
            weight: v.weight,
            height: v.height || 10,
            width: v.width || 10,
            depth: v.length || 10,
          };
        }),
        goods: _.map(shipment.parcel.items, item => {
          return {
            denomination: item.description,
            quantity: item.quantity,
            value: item.value,
            country: item.originCountry,
          };
        }),
      },
    };

    return body;
  }

  /**
   * 预下单
   * @param shipmentUrl
   * @param body
   * @private
   */
  private async preShipment(shipmentUrl: string, body: any) {
    try {
      const [data] = await this.request('POST', shipmentUrl, null, body);
      return data[1];
    } catch (e) {
      Logger.error(`GPX预下单失败：${e}`);
      throw new Error('预下单失败：' + e.message);
    }
  }

  /**
   * 上传发票
   * @param reference
   * @param base64
   * @param invoiceNumber
   * @param invoiceDate
   * @private
   */
  private async uploadInvoice(reference: string, base64: string, invoiceNumber: string, invoiceDate: string) {
    try {
      await this.request('POST', `${this.BaseUrl}/gpx_ws/${reference}/new_attachment`, null, {
        params: {
          type: 'inv',
          date: invoiceDate,
          number: invoiceNumber,
          file: base64,
        },
      });
    } catch (e) {
      Logger.error(`GPX上传发票失败：${e}`);
      throw new Error('上传发票失败：' + e.message);
    }
  }

  /**
   * 确认订单信息
   * @param reference
   * @private
   */
  private async confirmation(reference: string) {
    try {
      const data = await this.request('POST', `${this.BaseUrl}/gpx_ws/${reference}/confirmation`, null, {}, 15000);
      return data[1][1];
    } catch (e) {
      Logger.error(`GPX确认订单信息失败：${e}`);
      throw new Error('确认订单信息失败：' + e.message);
    }
  }

  /**
   * 获取面单
   * @param trackingNumber
   */
  async getLabel({ trackingNumber }) {
    const requestOptions = {
      uri: `${this.BaseUrl}/gpx_ws/${trackingNumber}/print_pieces_tags`,
      method: 'GET',
      timeout: 7000,
    };
    try {
      const buffer = await TransporterUtils.getBuffer(requestOptions);
      return buffer.toString('base64');
    } catch (e) {
      Logger.error(`GPX获取面单失败：${e}`);
      throw new Error('获取面单失败：' + e.message);
    }
  }

  async request(method: 'GET' | 'POST', url: string, params?: any, body = {}, timeout = 6000) {
    const options: AxiosRequestConfig = {
      method,
      url,
      params,
      data: body,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.Token}`,
      },
      timeout,
    };

    const { data } = await axios.request(options);
    const result = JSON.parse(data.result);
    if (result.code !== 0) {
      throw new Error(result.data.join('|'));
    }

    return result.data;
  }

  async fetchTrackingUnofficial2({ trackingNumberPostCodeArray, cmsEvents }) {
    const firstTrackingNumber = 'GPX:' + trackingNumberPostCodeArray[0]?.trackingNumber;

    try {
      const trackingArray = [];
      console.time(firstTrackingNumber);

      console.log(`${firstTrackingNumber}等等${trackingNumberPostCodeArray.length}个单号开始爬取...`);
      for (const { trackingNumber } of trackingNumberPostCodeArray) {
        const result = await this.singleTrackingRequest(trackingNumber);
        trackingArray.push(...result);
        await delay(3000);
      }
      console.timeLog(firstTrackingNumber, `${firstTrackingNumber}等等,爬取结束!`);

      console.timeEnd(firstTrackingNumber);
      const result = await super.descMapHandle(Transporter.GPX, trackingArray, cmsEvents, false);
      return {
        ...result,
        failedTrackingNumberArray: [],
      };
    } catch (e) {
      console.timeEnd(firstTrackingNumber);
      Logger.warn('GPX tracking: ' + e.message);
      return {
        clearCache: true,
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
  }

  async singleTrackingRequest(trackingNumber: string) {
    const url = `https://odoo.gpxlogistique.com/tracking?order_number=${trackingNumber}`;
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
          timestamp: moment.tz(rawTracking.date, 'DD/MM/YYYY', 'Europe/Paris').toDate(),
          description: rawTracking.desc,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn(`GPX trackingNumber:${trackingNumber},${e.message}`);
      return [];
    }
  }

  private async getRawTrackingArray(data: string) {
    const $ = cheerio.load(data);
    const array = [];
    $('.collapse .row.bg-secondary').each(function() {
      array.push({
        date: $(this)
          .find('div:eq(0) span:eq(0)')
          .text(),
        desc: $(this)
          .find('div:eq(1) span:eq(0)')
          .text(),
      });
    });
    return array;
  }
}
