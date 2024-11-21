import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import crypto from 'crypto';
import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import { LaposteTracking } from '@/domain/sci/transporter/broker/common/laposte-tracking';
import { Transporter } from '@/domain/utils/Enums';
import moment from 'moment';
import { delay } from '@/domain/utils/util';
import { Logger } from '@nestjs/common';

export class CainiaoBroker extends TransporterBroker {
  private TrackingUrl = process.env.NODE_ENV.includes('production')
    ? 'https://link.cainiao.com/gateway/link.do'
    : 'https://prelink.cainiao.com/gateway/link.do';

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
      msg_type: 'CN_OVERSEA_DL_CREATE_PACKAGE',
      logistic_provider_id: logistic_provider_id,
      to_code: 'CNL_EU',
      logistics_interface: dataStr,
      data_digest: sign,
    };

    try {
      const response = await this.postRequest(`${channelConfig.shipmentUrl}`, requestParam);

      if (response.data.success !== 'true') {
        throw new Error(response.data.errorMsg);
      }
      const { orderCreateResult } = response.data;
      let fileStr = orderCreateResult?.fileStr;
      delete response.data.orderCreateResult.fileStr;
      delete response.data.orderCreateResult.cloudPrintData;
      if (!fileStr) {
        const way_bill_param = { ...orderCreateResult, clientOrderId: data?.outOrderId };
        const wayBill_response = await this.getWayBill(way_bill_param, channelConfig);
        fileStr = wayBill_response.data.fileStr;
        response.data.printDataList = wayBill_response.data.printDataList;
      }
      return {
        // 实际派送商单号
        trackingNumber: orderCreateResult.mailNo,
        // 菜鸟单号
        shippingNumber: orderCreateResult.mailNo,
        // waybillNumber: orderCreateResult.logisticOrderCode,
        label: fileStr,
        labelFormat: channelConfig.labelFormat.labelType,
        transporterRequest: JSON.stringify(requestParam),
        transporterResponse: JSON.stringify(response.data),
        reference: shipment.parcel.reference,
      };
    } catch (e) {
      const error = e?.message || JSON.stringify(e);
      console.log(e);

      if (
        error.includes('CNGDF_G_GSR_API_RESULT_FAIL') ||
        error.includes('apollo_fulfill-oms#biz-routeApiResultEmpty-E')
      ) {
        throw new TransporterException('COLISSIMO', '收件邮编不在派送范围内', requestParam);
      } else {
        //菜鸟报错，前缀改成COLISSIMO
        throw new TransporterException(
          'COLISSIMO',
          error.replace(/cainiao/gi, '').replace(/alibaba/gi, ''),
          requestParam,
        );
      }
    }
  }

  // 获取面单
  async getWayBill(responseData, channelConfig) {
    const data = {
      logisticOrderCode: responseData.logisticOrderCode,
      clientOrderId: responseData.clientOrderId,
    };

    const { token, logistic_provider_id } = channelConfig.accountInfo;
    const { dataStr, sign } = this.encodeData(token, data);
    // 格式化请求体
    const requestParam = {
      msg_type: 'CN_OVERSEA_DL_GET_WAYBILL',
      logistic_provider_id: logistic_provider_id,
      to_code: 'CNL_EU',
      logistics_interface: dataStr,
      data_digest: sign,
    };

    const response = await this.postRequest(`${channelConfig.shipmentUrl}`, requestParam);
    if (response.data.success !== 'true') {
      throw new Error(response.data.errorMsg);
    }
    return response;
  }

  // 格式化报文内容
  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig, reference: string) {
    const { cainiaoIdentity, open_test = false } = channelConfig.accountInfo;
    let productCode = channelConfig.productCode;
    if (open_test && channelConfig.platform === 'FTL-OMS' && shipment.clientId === 'HKXYY') {
      // 6C
      if (channelConfig.productCode === '72004') {
        productCode = '72012';
      } else if (channelConfig.productCode === '72007') {
        // 6A
        productCode = '72011';
      }
    }

    const senderAddress =
      channelConfig.platform === 'FTL-OMS'
        ? {
            firstName: 'PETIT COLIS DISTRIBUTION',
            lastName: 'PETIT COLIS DISTRIBUTION',
            street1: 'Avenue du 21ème siècle',
            street2: null,
            street3: null,
            city: 'Tremblay-en-France',
            postalCode: '93290',
            countryCode: 'FR',
            company: 'FTL EXPRESS',
            email: 'no-reply@ftl-express.cn',
            mobileNumber: null,
            phoneNumber: '3631',
            province: null,
          }
        : shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    // 收件邮编是98000时，需要填写province，没有则用city填充
    if (receiverAddress.postalCode === '98000') {
      receiverAddress.province = receiverAddress.province || receiverAddress.city;
    }
    const parcel = shipment.parcel;
    const data = {
      cainiaoIdentity,
      // 是否同步返回面单
      syncGetAwb: 'true',
      // 外单id（唯一）
      outOrderId: reference,
      // opRequirements: { expectedDeliveryTime: '9:00 AM to 1:00 PM' },
      solutionParam: {
        solutionCode: 'EU_PARCEL_LOCAL_OPEN',
        logisticsParam: {
          isDesignatedCarrier: true,
          carrierCode: productCode,
          labelFormat: channelConfig.labelFormat.labelType,
        },
      },
      // 包裹信息
      packageParams: [parcel].map(item => this.parcelTransform(item)),
      // 收件地址信息
      receiverParam: this.addressTransform(receiverAddress),
      // 寄件地址信息
      senderParam: this.addressTransform(senderAddress),
      // 退件地址信息
      returnerParam: this.addressTransform(senderAddress),
    };
    return this.dataTypeTransform(data);
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
      address: {
        country: countryCode,
        zipcode: postalCode,
        province: province,
        district: city,
        city: city,
        addressLine1,
        // addressLine2: '',
        street: streetText,
        // exAddressID: '1',
        // addressType: 'portes',
        // addressID: '1',
      },
      name: TransporterUtils.getFullName(address),
      email: email,
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
    const totalAmount = MathCalculator.sumBy(items, item => MathCalculator.mul(item?.value, item?.quantity)) || 10;
    return {
      // 如果此字段不为空，则意味着菜鸟交接到包裹时，已经有面单在包裹上。菜鸟据此作后续派送或者换单
      // mailNo: 'S302070155-1',
      // 金额，币种
      // 注意：菜鸟的价值是按照"分"计算，所以要乘以100
      packageValue: { amount: this.toIntString(totalAmount * 100), currency: 'EUR' },
      // 体积重
      dimWeight: {
        weight: this.toIntString(weight * 1000),
        weightUnit: 'g',
        length: this.toIntString(length),
        width: this.toIntString(width),
        height: this.toIntString(height),
        dimensionUnit: 'cm',
      },
      // 海关信息
      itemParams: items.map(item => {
        //, weight, hsCode, originCountry
        const { description = 'description', quantity = 1, value = 10 } = item;
        return {
          quantity: this.toIntString(quantity),
          unitPrice: this.toIntString(value * 100),
          unitPriceCurrency: 'EUR',
          // secondaryName: description,
          name: description,
        };
      }),
    };
  }

  // 将数值传参修改为整数类型
  private toIntString(data) {
    try {
      if (typeof data === 'string') data = Number(data);
      return String(Math.round(data));
    } catch {
      return data;
    }
  }

  // 请求体格式化(toString)
  private dataTypeTransform(data) {
    if (_.isObject(data)) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if (_.isObject(data[key])) {
            data[key] = this.dataTypeTransform(data[key]);
          } else {
            data[key] = _.toString(data[key]);
          }
        }
      }
    }
    return data;
  }

  // post请求封装
  private async postRequest(url, param, timeOut = 15000) {
    const option: any = {
      url,
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(param),
      timeout: timeOut,
    };
    return await axios.request(option);
  }

  async fetchTrackingOfficial({ trackingNumberPostCodeArray }) {
    const trackingArray = [];

    const token = 'TlhK3UFZqVTN32LMVZ8i9t';
    const requestParam = {
      msg_type: 'CAINIAO_GLOBAL_FTL_CUSTOMS_LOGISTICS_DETAIL_QUERY',
      logistic_provider_id: 'GATE_30555996',
      to_code: 'CNGFC-LASTMILE',
    };

    for (const chunkData of _.chunk(trackingNumberPostCodeArray, 20)) {
      try {
        const promiseAll = chunkData.map(async ({ trackingNumber, shippingNumber }) => {
          const data = { logisticOrderCode: shippingNumber };
          const { dataStr, sign } = this.encodeData(token, data);
          requestParam['logistics_interface'] = dataStr;
          requestParam['data_digest'] = sign;

          try {
            const response = await this.postRequest(`${this.TrackingUrl}`, requestParam, 10000);
            if (response.data?.success === 'true' || response.data?.success === true) {
              trackingArray.push({
                trackingNumber,
                timestamp: moment.tz(response.data.operateTime, 'YYYY-MM-DD HH:mm:ss', 'Europe/Paris').toDate(),
                event: 'IN_TRANSIT',
                description: 'Received by local delivery company',
              });
            }
          } catch (e) {
            Logger.error(`${trackingNumber}:${e.message}`, e.stack);
          }
        });

        await Promise.all(promiseAll);
        await delay(500);
      } catch (e) {
        Logger.error(`获取菜鸟上网时间失败:${e.message()}`, e.stack);
      }
    }

    return trackingArray;
  }

  /**
   * 爬取轨迹（从法邮官网爬取）
   * @param trackingNumberArray
   */
  async fetchTrackingUnofficial3({ trackingNumberArray }) {
    if (_.isEmpty(trackingNumberArray)) {
      return {
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
    const laposteTracking = new LaposteTracking();
    const { trackingArray, failedTrackingNumberArray } = await laposteTracking.fetchTrackingFromWebSite(
      trackingNumberArray,
      Transporter.CAINIAO,
    );
    return {
      trackingArray,
      failedTrackingNumberArray,
    };
  }

  /**
   * reference去除特殊字符后，在后面补加三位随机数
   * @param reference
   * @private
   */
  private referenceHandle(reference: string) {
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    reference = reference.replace(/[^a-zA-Z0-9-_]/g, '');
    return `${reference}_${randomNum}`;
  }
}
