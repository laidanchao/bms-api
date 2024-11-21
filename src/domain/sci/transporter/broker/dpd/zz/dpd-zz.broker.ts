import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import request from 'request-promise';
import { plainToClass } from 'class-transformer';
import { DataBuilder } from '@/domain/sci/transporter/broker/dpd/zz/request/data-builder';
import { LabelRes, LabelResData } from '@/domain/sci/transporter/broker/dpd/zz/response/label-res';
import { LoginRes, LoginResData } from '@/domain/sci/transporter/broker/dpd/zz/response/login-res';
import _ from 'lodash';
import moment from 'moment';
import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { TransporterException } from '@/app/exception/transporter-exception';
import { Logger } from '@/app/logger';

//  1. 把相关account信息和接口url在测试环境配置好. 2.通过postman调用parcelService下多包裹单成功创建. 3.数据库查看parcel是否已经被成功保存.
//  4.把获取轨迹的接口对接好
// dpd中国, 目前只有测试环境的数据
// 我们ServiceTypeName可以填 DPD Home 或者 DPD Business
@Injectable()
export class DpdZzBroker extends TransporterBroker {
  shipmentUrl: string;

  async create(
    shipment: CreateClientDto,
    channelConfig: BaseConfig,
  ): Promise<CreateParcelResponse[] | CreateParcelResponse> {
    this.shipmentUrl = channelConfig.shipmentUrl;
    if (!shipment.parcels && shipment.parcel) {
      shipment.parcels = [shipment.parcel];
    }
    // 验证shipment的参数, 比如DpdZZ包裹items必填
    const accountInfo = channelConfig.accountInfo;
    const account: any = {
      userName: accountInfo.username,
      password: accountInfo.password,
      customerName: accountInfo.customerName || 'FXWL', // 生产账号的customerName: 'FXWL'
    };
    // 1. 登陆
    const loginResData: LoginResData = await this.login(account);
    // 2. 构建body
    const { body } = DataBuilder.buildBody(
      loginResData.timeDifference,
      loginResData.token,
      channelConfig.productCode,
      account.customerName,
      shipment,
    );
    // 3. 发送请求
    const apiUrl = `${this.shipmentUrl}/create_shipment_info`;
    const options = {
      uri: apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        encryption: false,
      },
      body: body,
      timeout: 10000,
    };
    const res = await request(options);

    // 4.打印response报文, 并convert to 响应结果
    const response = JSON.parse(decodeURIComponent(res));
    if (response.code !== '200') {
      Logger.info(JSON.stringify(response));
      throw new TransporterException('DPD_ZZ', response.msg, options);
    }
    const labelRes = plainToClass(LabelRes, response);
    const labelResData: LabelResData = labelRes.data;

    // TODO xiewenzhen 最好只做单包裹, 多包裹还没想明白
    //  1. 多包裹的第二个包裹的trackingNumber获取不到, 如果返回的shipmentNumber: 84120000072016 则第二个包裹的shipmentNumber: 84120000072017,
    //  2. DPD目前是shipmentNumber === trackingNumber
    //  3. 多包裹还有一个CN23的问题: 假如listShipmentItemDetail个数为4个, 则两个包裹的清关单里, 物品个数都是4个.
    //  4. 多包裹的面单, 只返回一个coloaderLabel, 但是包含了两页. 第一页是84120000072016, 第二页是84120000072017
    //  5. 多包裹的cn23清关单, 只返回一个rpxLabel, 但是包含了两页. 第一页是84120000072016, 第二页是84120000072017
    // 5.组装client统一返回结果
    const results = _.map(shipment.parcels, (parcel, index) => {
      const trackingNumber = Number(labelResData.coloaderNumber) + index;
      let label = labelResData.coloaderLabel;
      let cn23 = labelResData.rpxLabel || '';
      if (index > 0) {
        label = '';
        cn23 = '';
      }
      const response: CreateParcelResponse = {
        trackingNumber,
        label,
        shippingNumber: labelResData.shipmentNumber,
        labelFormat: channelConfig.labelFormat.labelType || 'pdf',
        cn23,
        transporterRequest: JSON.stringify(options),
        transporterResponse: JSON.stringify(res),
      };
      return response;
    });
    return results;
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const trackingArray = [];
    const loginResData = await this.login({ userName: accountInfo.username, password: accountInfo.password });
    for (const trackingNumber of trackingNumberArray) {
      const jsonData = JSON.stringify({ shipmentNumber: trackingNumber });
      const body = `AccessToken=${loginResData.token}&Signature=&TimeStamp=${Date.now() +
        loginResData.timeDifference}&Data=${jsonData}`;
      const encodedBody = encodeURIComponent(body);

      const option = {
        // uri: 'http://testapi.rpx.com.cn/roms_api/list_shipment_tracking_info',
        uri: `${this.shipmentUrl}/list_shipment_tracking_info`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          encryption: false,
        },
        body: encodedBody,
      };
      const response = JSON.parse(decodeURIComponent(await request(option)));
      if (response.code === '200') {
        const tracking = {
          timestamp: moment(response.data[0].eventDatetime, 'YYYY-MM-DD+HH:mm:ss').toDate(),
          event: response.data[0].eventCode,
          location: response.data[0].location,
          description: response.data[0].description,
        };
        trackingArray.push(tracking);
      } else {
        throw new TransporterException('DPD_ZZ', response.msg);
      }
    }
    return trackingArray;
  }

  // TODO step2 xiewenzhen 这里ROMS接口文档有说明登陆成功后token的有效期为20分钟
  async login(account): Promise<LoginResData> {
    const loginData: any = {
      userName: account.userName,
      password: account.password,
    };
    const options = {
      // uri: 'http://api.rpx.com.cn/roms_api/user_authentication',
      uri: `${this.shipmentUrl}/user_authentication`,
      method: 'POST',
      body: Buffer.from(JSON.stringify(loginData)).toString('base64'),
      json: true,
      headers: {
        encryption: false,
      },
    };
    const response = await request(options);
    const res = decodeURIComponent(response);
    Logger.info(res);
    const loginRes: LoginRes = plainToClass(LoginRes, JSON.parse(res));
    if (loginRes.code !== '200') {
      Logger.error(loginRes.msg);
      throw new TransporterException('DPD_ZZ', res, options);
    }
    loginRes.data.timeDifference = new Date().getTime() - loginRes.data.timestamp;
    return loginRes.data;
  }
}
