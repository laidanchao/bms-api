import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import moment from 'moment';
import { delay } from '@/domain/utils/util';
import { Logger } from '@nestjs/common';

export class CainiaoV2Broker extends TransporterBroker {
  private TrackingUrl = process.env.NODE_ENV.includes('production')
    ? 'https://link.cainiao.com/gateway/link.do'
    : 'https://link.cainiao.com/gateway/custom/open_integration_test_env';

  // 下单
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const randomNum = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    shipment.parcel.reference = shipment.parcel.reference || `REF_${new Date().getTime().toString()}_${randomNum}`;
    const newReference = this.referenceHandle(shipment.parcel.reference);
    const data = this.buildData(shipment, channelConfig, newReference);
    const { token, logistic_provider_id } = channelConfig.accountInfo;
    const { dataStr, sign } = this.encodeData(token, data);
    // 格式化请求体
    const requestParam = {
      msg_type: 'cnge.order.create',
      logistic_provider_id,
      to_code: 'CNGCP-OPEN',
      logistics_interface: dataStr,
      data_digest: sign,
    };

    try {
      const response = await this.postRequest(`${channelConfig.shipmentUrl}`, requestParam);

      if (response.data.success !== 'true') {
        throw new Error(response.data.errorMsg);
      }
      const { trackingNumber, orderCode: shippingNumber } = response.data.data;
      let labelBase64Str;
      if (shippingNumber) {
        labelBase64Str = await this.getWayBill(shippingNumber, channelConfig);
      }
      return {
        // 实际派送商单号
        trackingNumber,
        // 菜鸟单号
        shippingNumber,
        label: labelBase64Str,
        labelFormat: channelConfig.labelFormat.labelType,
        transporterRequest: JSON.stringify(requestParam),
        transporterResponse: JSON.stringify(response.data),
        reference: shipment.parcel.reference,
      };
    } catch (e) {
      const error = e?.message || JSON.stringify(e);
      console.log(e);
      throw new TransporterException(
        'COLISSIMO',
        error.replace(/cainiao/gi, '').replace(/alibaba/gi, ''),
        requestParam,
      );
    }
  }

  // 获取面单
  async getWayBill(shippingNumber, channelConfig) {
    const data = {
      locale: 'zh_CN',
      waybillType: '1',
      orderCode: shippingNumber,
    };

    const { token, logistic_provider_id } = channelConfig.accountInfo;
    const { dataStr, sign } = this.encodeData(token, data);
    // 格式化请求体
    const requestParam = {
      msg_type: 'cnge.waybill.get',
      logistic_provider_id,
      to_code: 'CGOP',
      logistics_interface: dataStr,
      data_digest: sign,
    };

    const response = await this.postRequest(`${channelConfig.shipmentUrl}`, requestParam);
    if (response.data.success !== 'true') {
      throw new Error(response.data.errorMsg);
    }
    return response.data.data.waybillPdfData || '';
  }

  // 格式化报文内容
  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig, reference: string) {
    const parcel = shipment.parcel;

    const data = {
      overseasReturnerParam: {
        zipCode: '95928',
        city: 'ROISSY CDG CEDEX 2',
        countryCode: 'FR',
        street: 'non sav',
        name: 'PETIT COLIS DISTRIBUTION',
        detailAddress: 'contacter vendeur',
        telephone: '3631',
        email: '1938943@163.com',
      },
      syncGetTrackingNumber: true,
      // 外单id（唯一）
      outOrderId: reference,
      sourceHandoverParam: {
        code: 'CDG',
        type: 'PORT',
      },
      solutionParam: {
        unreachableReturnParam: {
          whetherNeed: 'true',
          unreachableStrategy: 'hold',
        },
        customerChooseCarrierParam: {
          carrierCode: channelConfig.productCode,
        },
        solutionCode: 'CN_GLO_CD_STD',
      },
      // 收件地址信息
      receiverParam: this.addressTransform(shipment.receiverAddress),
      // 寄件地址信息
      senderParam: {
        countryCode: 'CN',
        zipCode: '310000',
        state: 'Zhejiang',
        city: 'Hangzhou',
        detailAddress: 'address',
        street: 'street',
        name: 'FTL',
        email: '1938943@163.com',
        telephone: '0571-85285360',
      },
      // 包裹信息
      packageParams: [parcel].map(this.parcelTransform),
    };
    return data;
  }

  /**
   * 加密数据
   * @param token
   * @param data
   */
  encodeData(token, data) {
    const dataStr = JSON.stringify(data);
    const str = dataStr + token;
    const sign = crypto
      .createHash('md5')
      .update(str)
      .digest('base64');

    return {
      dataStr,
      sign,
    };
  }

  // 地址格式化
  private addressTransform(address) {
    const {
      countryCode,
      postalCode,
      province,
      city,
      street1,
      street2,
      street3,
      mobileNumber,
      phoneNumber,
      email,
    } = address;
    const streetArray = [street1, street2, street3].filter(street => !!street);
    // addressLine1：详细地址，必填
    // street：街道地址，不必填，但是显示在详细地址前面
    let addressLine1 = '',
      streetText = '';
    if (streetArray.length === 1) {
      addressLine1 = streetArray[0];
    } else if (streetArray.length > 1) {
      streetText = streetArray[0];
      addressLine1 = streetArray.splice(1).join(' ');
    }
    return {
      countryCode: countryCode,
      zipCode: postalCode,
      state: province,
      district: city,
      city: city,
      detailAddress: addressLine1,
      street: streetText,
      name: TransporterUtils.getFullName(address),
      email,
      mobilePhone: mobileNumber,
      telephone: phoneNumber,
    };
  }

  // 包裹信息格式化
  private parcelTransform(parcel) {
    // 包裹体积及商品价值都默认 = 10
    const { weight, width = 10, height = 10, length = 10 } = parcel;
    let items = parcel.items;
    if (_.isEmpty(items)) {
      items = [{ description: 'description', quantity: 1, value: 10 }];
    }
    return {
      weight: weight * 1000,
      length,
      width,
      height,
      itemParams: items.map(item => {
        return {
          quantity: item.quantity,
          chineseName: item.description,
          englishName: item.description.replace(/[\u4e00-\u9fa5]/g, '') || 'description',
          unitPrice: item.value * 100, // 此字段单位为‘分’，所以要乘以100
          unitPriceCurrency: 'EUR',
        };
      }),
    };
  }

  // post请求封装
  private async postRequest(url, param, timeOut = 10000) {
    const option: any = {
      url,
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(param),
      timeout: timeOut,
    };
    return await axios.request(option);
  }

  async fetchTrackingOfficial({ trackingNumberPostCodeArray, accountInfo }) {
    const trackingArray = [];

    const { logistic_provider_id, token } = accountInfo;
    const requestParam = {
      msg_type: 'cnge.track.get',
      logistic_provider_id,
      to_code: 'TRACK',
    };

    for (const chunkData of _.chunk(trackingNumberPostCodeArray, 20)) {
      try {
        const promiseAll = chunkData.map(async ({ trackingNumber, shippingNumber }) => {
          const data = { locale: 'zh_CN', orderCode: shippingNumber, onlyOfficialNode: true };
          const { dataStr, sign } = this.encodeData(token, data);
          requestParam['logistics_interface'] = dataStr;
          requestParam['data_digest'] = sign;

          try {
            const { data: responseData } = await this.postRequest(`${this.TrackingUrl}`, requestParam, 20000);
            if (responseData.data?.success === 'true' || responseData.data?.success === true) {
              responseData.data.traceDetailList.map(item => {
                trackingArray.push({
                  trackingNumber,
                  timestamp: moment(item.time + item.timeZone, 'YYYY-MM-DD HH:mm:ssZ').toDate(),
                  event: item.actionCode,
                  description: item.desc,
                });
              });
            }
          } catch (e) {
            Logger.error(`${trackingNumber}:${e.message}`, e.stack);
          }
        });

        await Promise.all(promiseAll);
        await delay(1000);
      } catch (e) {
        Logger.error(`获取菜鸟V2轨迹失败:${e.message}`, e.stack);
      }
    }

    return trackingArray;
  }

  /**
   * reference去除特殊字符后，在后面补加两位随机数
   * @param reference
   * @private
   */
  private referenceHandle(reference: string) {
    const randomNum = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');

    reference = reference.replace(/[^a-zA-Z0-9-_]/g, '');
    return `${reference}_${randomNum}`;
  }
}
