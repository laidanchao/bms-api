import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import axios, { AxiosRequestConfig } from 'axios';
import moment from 'moment/moment';

@Injectable()
export class DpdCnBroker extends TransporterBroker {
  shipmentUrl: string;

  async create(
    shipment: CreateClientDto,
    channelConfig: BaseConfig,
  ): Promise<CreateParcelResponse[] | CreateParcelResponse> {
    // 1.登录获取token
    const loginToken = await this.loginGetToken(channelConfig.accountInfo, channelConfig.shipmentUrl);
    // 2.整合下单数据
    const body = this.buildBody(shipment, channelConfig.productCode);
    // 3. 下单获取trackingNumber
    const orderOption: AxiosRequestConfig = {
      method: 'POST',
      baseURL: channelConfig.shipmentUrl,
      url: 'services/app/hawb/apiCreateHawb',
      responseType: 'json',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${loginToken}`,
      },
      data: body,
      timeout: 10000,
    };
    const orderResult = await this.axiosRequest(orderOption);
    if (!orderResult.hawbNumber) {
      throw new TransporterException('DPD_CN', orderResult.resultMsg, orderOption);
    }
    const response: CreateParcelResponse = {
      trackingNumber: orderResult.hawbNumber,
      label: '',
      labelUrl: orderResult.resultMsg,
      shippingNumber: '',
      labelFormat: channelConfig.labelFormat.labelType,
      transporterRequest: JSON.stringify(orderOption),
      transporterResponse: JSON.stringify(orderResult),
    };
    return response;
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    // 暂时没有接通
    return;
    const loginToken = await this.loginGetToken(
      { username: accountInfo.username, password: accountInfo.password },
      'http://www.hub-ez.com/api/',
    );
    const trackingArray = [];
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 50)) {
      const option: AxiosRequestConfig = {
        method: 'POST',
        baseURL: 'http://APITracking.hub-ez.com/api/',
        url: 'services/app/hawb/ApiGetHawbTracking',
        responseType: 'json',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${loginToken}`,
        },
        data: chunkTrackingNumberArray,
      };
      const trackingResult = await this.axiosRequest(option);
      _.map(trackingResult, it => {
        return it.searchHawbForTrackList.map(item => {
          const tracking = {
            trackingNumber: it.hawbNumber,
            event: item.statusCode,
            timestamp: moment.utc(item.eventTime).toDate(),
            description: item.desc,
            fromFile: false,
            location: item.locationName,
          };
          trackingArray.push(tracking);
        });
      });
    }
    return trackingArray;
  }

  /**
   * 包裹取消
   * @param cancelParcel CancelParcelDto
   * @param channelConfig BaseConfig
   */
  async cancelShipment(cancelParcel: CancelParcelDto, channelConfig: BaseConfig) {
    const loginToken = await this.loginGetToken(channelConfig.accountInfo, channelConfig.shipmentUrl);
    const orderOption: AxiosRequestConfig = {
      method: 'POST',
      baseURL: channelConfig.shipmentUrl,
      url: 'services/app/hawb/ApiCancelHawb',
      responseType: 'json',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${loginToken}`,
      },
      data: cancelParcel.trackingNumbers,
    };
    const res = await axios.request(orderOption);
    if (res.status !== 200) {
      throw new TransporterException('DPD_CN', res.data.error, orderOption);
    }
    return res.data.result;
  }

  /**
   * 登录获取token
   * @param account 账密信息
   * @param shipmentUrl url
   */
  async loginGetToken(account, shipmentUrl) {
    const loginData: any = {
      UsernameOrEmailAddress: account.username,
      Password: account.password,
    };
    const options: AxiosRequestConfig = {
      method: 'POST',
      baseURL: shipmentUrl,
      url: 'account/Authenticate',
      responseType: 'json',
      headers: {
        'content-type': 'application/json',
      },
      data: loginData,
    };
    return await this.axiosRequest(options);
  }

  buildBody(shipment: CreateClientDto, productCode) {
    const { senderAddress, receiverAddress, parcel } = shipment;
    const senderName = this.getFullName(senderAddress.firstName, senderAddress.lastName);
    const receiverName = this.getFullName(receiverAddress.firstName, receiverAddress.lastName);
    const hawbItems = _.map(parcel.items, it => {
      return {
        content: it.description,
        price: it.value,
        pieces: it.quantity,
        weight: it.weight,
        hsCode: it.hsCode,
      };
    });
    const body = {
      customerHawb: parcel.reference,
      hawbNumber: null,
      senderName,
      senderAddress: senderAddress?.street1 + senderAddress?.street2 + senderAddress?.street3,
      senderPhone: senderAddress.phoneNumber,
      receiverName: receiverName,
      receiverAddress1: receiverAddress?.street1 + receiverAddress?.street2 + receiverAddress?.street3,
      receiverTown: '',
      receiverTel: receiverAddress.phoneNumber,
      ReceiverContactPerson: null,
      receiverCountry: receiverAddress.countryCode,
      receiverProvince: receiverAddress.province,
      receiverCity: receiverAddress.city,
      receiverZip: receiverAddress.postalCode,
      weight: parcel.weight,
      declareCurrency: 'EUR',
      declareValue: parcel.value, // 申报价值
      serviceCode: productCode,
      dutyType: 'DDP',
      content: shipment.description,
      receiverEmail: receiverAddress.email,
      receiverId: null,
      importBatchId: null,
      shipmentType: parcel?.options?.customsCategory, // 是不是文件 有参数平台传
      PaymentType: null,
      height: parcel.height,
      width: parcel.width,
      length: parcel.length,
      InsuranceValue: parcel.insuranceValue,
      GenerateShippingLabel: true,
      remark: parcel.instructions,
      hawbItems,
    };
    return body;
  }

  private async axiosRequest(option: AxiosRequestConfig) {
    const res = await axios.request(option);
    if (res.status !== 200) {
      throw new TransporterException('DPD_CN', res.data.error, option);
    }
    return res.data.result;
  }

  private getFullName(firstName, lastName): string {
    if (!firstName && !lastName) {
      return '';
    }
    return `${firstName ? firstName + ' ' : ''}${lastName || ''}`;
  }
}
