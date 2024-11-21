import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';

import axios from 'axios';
import crypto from 'crypto';
import qs from 'qs';
import { TransporterException } from '@/app/exception/transporter-exception';
import _ from 'lodash';
import { StoOption } from '@/domain/sci/transporter/broker/sto/sto.option';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Logger } from '@/app/logger';

export class StoBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const appToken = channelConfig.accountInfo.appToken;
    const paramsJson = StoBroker.buildData(shipment, channelConfig);
    const timestamp = parseInt(new Date().valueOf() / 1000 + '') + '';
    const signature = StoBroker.encodeData(appToken, paramsJson, timestamp);

    let result: any;
    const requestData = qs.stringify({
      appToken,
      serviceMethod: 'createorder',
      paramsJson,
      signature,
      timestamp,
    });
    try {
      result = (
        await axios.request({
          url: channelConfig.shipmentUrl,
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: requestData,
          timeout: 10000,
        })
      ).data;
    } catch (e) {
      throw new TransporterException('STO', e.message, requestData);
    }
    if (result.code.toString() === '1') {
      return {
        trackingNumber: result.data.trackingNumber,
        shippingNumber: result.data.referenceNumber,
        label: null,
        labelUrl: result.data.labelFile,
        labelFormat: channelConfig.labelFormat.labelType,
      };
    } else {
      throw new TransporterException('STO', result.msg, requestData);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo, webServiceUrl }) {
    const appToken = accountInfo.appToken;
    const timestamp = parseInt(new Date().valueOf() / 1000 + '') + '';
    const paramsJson = JSON.stringify({ trackingNumber: trackingNumberArray.join(',') });
    const signature = StoBroker.encodeData(appToken, paramsJson, timestamp);

    let result: any;
    try {
      result = (
        await axios.request({
          url: webServiceUrl,
          method: 'post',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: qs.stringify({
            appToken,
            serviceMethod: 'searchtrack',
            paramsJson,
            signature,
            timestamp,
          }),
        })
      ).data;
    } catch (e) {
      Logger.error(e.message);
      return [];
    }
    if (result.code.toString() === '1') {
      // 需要单号进行测试
      return _.flatMapDeep(
        result.data.map(parcel => {
          parcel.track.map(rawTrack => {
            return {
              trackingNumber: parcel.trackingNumber,
              timestamp: rawTrack.time, //TODO
              event: rawTrack.status,
              description: rawTrack.context,
              location: rawTrack.location,
            };
          });
        }),
      );
    } else {
      Logger.error(result.msg);
      return [];
    }
  }

  private static buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const stoOption = <StoOption>shipment.options || {};
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;

    const data = {
      order: {
        referenceNumber: shipment.parcel.reference,
        warehouseCode: stoOption.warehouseCode,
        productCode: channelConfig.productCode,
        weight: shipment.parcel.weight,
        // 重量单位，默认KG
        weightUnit: 'KG',
      },
      shipper: {
        shipperName: `${senderAddress.firstName || ''} ${senderAddress.lastName || ''}`,
        shipperCountry: senderAddress.countryCode,
        shipperCompany: senderAddress.company,
        shipperPhone: senderAddress.mobileNumber || senderAddress.phoneNumber,
        shipperProvince: senderAddress.province,
        shipperCity: senderAddress.city,
        shipperAddress: `${senderAddress.street1 || ''} ${senderAddress.street2 || ''} ${senderAddress.street3 || ''}`,
      },
      consignee: {
        consigneeName: `${receiverAddress.firstName || ''} ${receiverAddress.lastName || ''}`,
        // 收件人国家，默认CN(中国)
        consigneeCountry: receiverAddress.countryCode,
        consigneePhone: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
        consigneeProvince: receiverAddress.province,
        consigneeCity: receiverAddress.city,
        // 如果没有填写省市区，则收件人地址必须是包含省市区的详细地址，否则会导致派送地址错误
        consigneeAddress: `${receiverAddress.street1 || ''} ${receiverAddress.street2 ||
          ''} ${receiverAddress.street3 || ''}`,
      },
      goods: shipment.parcel.items.map(item => {
        return {
          name: item.description,
          qty: item.quantity,
          // 申报价值，默认人民币
          price: item.value,
        };
      }),
    };
    return JSON.stringify(data);
  }

  private static encodeData(appToken: string, paramsJson: string, timestamp: string) {
    // 1) 将appToken、paramsJson、timestamp三个参数值进行字典序排序；
    // 2) 将三个参数值拼接成一个字符串进行md5加密；
    return crypto
      .createHash('md5')
      .update([timestamp, appToken, paramsJson].join(''))
      .digest('hex');
  }
}
