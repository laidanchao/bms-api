import { Injectable, Logger } from '@nestjs/common';
import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { Moment } from '@softbrains/common-utils';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

@Injectable()
export class MfbBroker extends TransporterBroker {
  constructor() {
    super();
  }
  private TrackingUrl = process.env.NODE_ENV.includes('production')
    ? 'https://api.myflyingbox.com/v2'
    : 'https://test.myflyingbox.com/v2';

  /**
   * 创建订单
   * @param shipment
   * @param channelConfig
   */
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { labelFormat, shipmentUrl } = channelConfig;
    let response: any;
    let transporterRequest: any;
    try {
      shipment.parcels = [shipment.parcel];
      // 获取可用路线及其报价
      const offer_id = await this.getRateId(shipment, channelConfig);
      transporterRequest = this._buildShipmentBody(shipment, labelFormat, offer_id);
      // 下单及获取面单
      response = await this.shipments(shipmentUrl, channelConfig, transporterRequest);
    } catch (e) {
      throw new TransporterException('MFB', e.message, JSON.stringify(e.cmsTransporterRequest));
    }
    const { id, parcels, label } = response;
    const [parcel] = parcels;
    return {
      shippingNumber: id,
      trackingNumber: parcel.reference,
      label,
      labelUrl: '',
      labelFormat: labelFormat.labelType,
      transporterRequest: JSON.stringify(transporterRequest),
      transporterResponse: JSON.stringify(response),
      reference: parcel.shipper_reference,
    };
  }

  /**
   * 获取对应路线的rate-offerId
   * @param shipment
   * @param channelConfig
   */
  async getRateId(shipment, channelConfig) {
    const path = '/quotes';
    const { productCode } = channelConfig;
    const shipmentBody = this._buildRateShipmentBody(shipment, channelConfig);
    const data = await this._post(channelConfig, path, shipmentBody);
    const rates = data.offers || [];
    const rateService = _.find(rates, rate => rate?.product?.code === productCode);
    if (!rateService) {
      throw Error('Route is not variable for this request');
    }
    return rateService.id;
  }

  /**
   * 下单请求
   * @param shipmentUrl
   * @param accountInfo
   * @param body
   */
  async shipments(shipmentUrl, channelConfig, body) {
    try {
      const path = '/orders';
      const data = await this._post(channelConfig, path, body);
      data.label = await this.getOrderLabels(channelConfig, data.id);
      return data;
    } catch (e) {
      throw Error(e.message);
    }
  }

  /**
   * 获取包裹面单
   * @param shipmentUrl
   * @param accountInfo
   * @param id
   */
  async getOrderLabels(channelConfig, id) {
    try {
      const { shipmentUrl, accountInfo } = channelConfig;
      const authorizationHeader = this._formatBasicAuth(accountInfo);
      const response = await axios.request({
        url: `${shipmentUrl}/orders/${id}/labels`,
        method: 'get',
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
      });
      return response.data.toString('base64');
    } catch (e) {
      throw Error(e.message);
    }
  }

  /**
   * 取消包裹
   * @param cancelParcel CancelParcelDto
   * @param channelConfig BaseConfig
   */
  async cancelShipment(cancelParcel: CancelParcelDto, channelConfig: BaseConfig) {
    const { shipmentUrl, accountInfo } = channelConfig;
    const authorizationHeader = this._formatBasicAuth(accountInfo);
    try {
      const response = await axios.request({
        url: `${shipmentUrl}/orders/${cancelParcel.shippingNumber}/cancel`,
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
      });
      return response.data;
    } catch (e) {
      throw new TransporterException('MFB', e?.response?.data?.error.message || e?.message || e);
    }
  }

  /**
   * 根据包裹shippingNumber+trackingNumber获取包裹轨迹
   * @param trackingNumberPostCodeArray
   * @param accountInfo
   */
  async fetchTrackingOfficial({ trackingNumberPostCodeArray, accountInfo }) {
    const authorizationHeader = this._formatBasicAuth(accountInfo);
    const parcelTrackingArray: any[] = await Promise.all(
      trackingNumberPostCodeArray.map(async ({ trackingNumber, shippingNumber }) => {
        try {
          const { data } = await axios.request({
            url: `${this.TrackingUrl}/orders/${shippingNumber}/tracking`,
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              ...authorizationHeader,
            },
          });
          if (data.status === 'success') {
            return data.data.find(d => d.parcel_reference === trackingNumber) || null;
          }
        } catch (e) {
          Logger.error(`${trackingNumber}:${e.message}`, e.stack);
        }
      }),
    );
    const trackingArray = [];
    parcelTrackingArray.forEach(parcelEvent => {
      parcelEvent?.events.forEach(event => {
        trackingArray.push({
          trackingNumber: parcelEvent.parcel_reference,
          timestamp: moment.tz(event.happened_at, 'YYYY-MM-DD HH:mm:ss', 'Europe/Paris').toDate(),
          event: event.code,
          description: event?.label?.fr || event?.label?.en,
          location: event?.location?.city || null,
        });
      });
    });
    return trackingArray;
  }

  /**
   * 格式化获取定价请求体
   * @param shipment
   * @param channelConfig
   */
  _buildRateShipmentBody(shipment, channelConfig) {
    const { senderAddress, receiverAddress, parcels } = shipment;
    return {
      quote: {
        shipper: {
          country: senderAddress.countryCode,
          postal_code: senderAddress.postalCode,
          city: senderAddress.city,
        },
        recipient: {
          is_a_company: !!receiverAddress.company,
          country: receiverAddress.countryCode,
          postal_code: receiverAddress.postalCode,
          city: receiverAddress.city,
        },
        parcels: parcels.map(parcel => {
          return {
            weight: parcel.weight,
            length: parcel.length,
            width: parcel.width,
            height: parcel.height,
          };
        }),
        offers_filters: {
          // with_carrier_codes: ['colissimo'],
          with_product_codes: [channelConfig.productCode],
        },
      },
    };
  }

  /**
   * 格式化下单请求体
   * @param shipment
   * @param offer_id
   */
  _buildShipmentBody(shipment, labelFormat, offer_id) {
    const { senderAddress, receiverAddress, parcels } = shipment;
    return {
      order: {
        offer_id: offer_id,
        // thermal_labels=true → A6，默认=A4，不支持zpl格式
        thermal_labels: labelFormat.code === 'A6_PDF',
        shipper: {
          name: `${senderAddress.firstName} ${senderAddress.lastName}`,
          company: senderAddress.company,
          street: `${senderAddress.street1} ${senderAddress.street2} ${senderAddress.street3}`,
          state: senderAddress.countryCode,
          phone: senderAddress.phoneNumber || senderAddress.mobileNumber,
          email: senderAddress.email,
          collection_date: Moment(new Date())
            .tz('Europe/Paris')
            .add(1, 'days')
            .format('YYYY-MM-DD'),
        },
        recipient: {
          // 传代收点id，会忽视其它收件地址
          location_code: shipment?.options?.relayPointId || null,
          name: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
          company: receiverAddress.company,
          street: `${receiverAddress.street1} ${receiverAddress.street2} ${receiverAddress.street3}`,
          state: receiverAddress.countryCode,
          phone: receiverAddress.phoneNumber || receiverAddress.mobileNumber,
          email: receiverAddress.email,
        },
        parcels: parcels.map(parcel => {
          let p: any = {
            shipper_reference: parcel.reference,
          };
          if (!_.isEmpty(parcel.items)) {
            p = {
              ...p,
              value: _.sumBy(parcel.items, 'value'),
              currency: 'EUR',
              description: parcel.items[0].description,
              country_of_origin: parcel.items[0].originCountry,
              customs_items: parcel.items.map(item => {
                return {
                  quantity: item.quantity,
                  unit_value: item.value,
                  value_currency: 'EUR',
                  country_of_origin: item.originCountry,
                  customs_code: item.hsCode,
                  description: item.description,
                  unit_weight: item.weight,
                  mass_unit: 'kg',
                };
              }),
              customs_details: {
                invoice_number: shipment.options?.invoiceNumber || '',
                reason_for_export: this._getSendingReasonDescription(_.head(parcels)?.options?.sendingReason || ''),
                // 固定传1即可
                ship_price: 1,
                ship_currency: 'EUR',
                insurance_price: shipment.parcels[0].insuranceValue || 0,
                insurance_currency: 'EUR',
              },
            };
          }
          return p;
        }),
      },
    };
  }

  /**
   * 格式化寄送原因
   * @param sendingReason
   * @private
   */
  private _getSendingReasonDescription(sendingReason) {
    switch (true) {
      case sendingReason === 'Gift':
        return 'gift';
      case sendingReason === 'Samples':
        return 'sample';
      case sendingReason === 'Sale of merchandise':
        return 'commercial';
      case sendingReason === 'Documents':
        return 'personal';
      case sendingReason === 'merchandise return':
        return 'return_for_repair';
      default:
        return 'commercial';
    }
  }

  /**
   * 设置header权限信息
   * @param accountInfo
   */
  _formatBasicAuth(accountInfo) {
    const { login, password } = accountInfo;
    return {
      Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
    };
  }

  /**
   * 封装常用的post请求
   * @param channelConfig
   * @param path
   * @param body
   * @private
   */
  private async _post(channelConfig, path, body) {
    const { shipmentUrl, accountInfo } = channelConfig;
    try {
      const authorizationHeader = this._formatBasicAuth(accountInfo);
      const response = await axios.request({
        url: `${shipmentUrl}${path}`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        data: body,
      });
      const { status, data } = response.data;
      if (status === 'success') {
        return data;
      } else {
        throw Error(data?.error?.message);
      }
    } catch (e) {
      throw Error(e.response?.data?.error?.message || e.message);
    }
  }
}
