import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import request from 'request-promise';
import 'moment-timezone';
import * as PDFUtils from '@ftlab/pdf-utils';
import { Injectable } from '@nestjs/common';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import _ from 'lodash';
import { TransporterException } from '@/app/exception/transporter-exception';
import axios from 'axios';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { AsendiaOption } from '@/domain/sci/transporter/broker/asendia/asendia.option';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { Logger } from '@/app/logger';
import { delay, getHttpAgent } from '@/domain/utils/util';

@Injectable()
export class AsendiaBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const result = await this.promiseCreate(shipment, channelConfig);
    const { accountInfo: account, labelFormat } = channelConfig;
    const trackingNumber = result.TrackingNo;
    const shippingNumber = result.ParcelId;
    const label = await this.getLabel({ trackingNumber, account, labelFormat });
    return {
      trackingNumber,
      shippingNumber,
      label: label,
      labelFormat: labelFormat.labelType,
      transporterRequest: result.transporterRequest,
      transporterResponse: result.transporterResponse,
    };
  }

  private async promiseCreate(shipment, channelConfig): Promise<any> {
    const { senderAddress, receiverAddress, parcel } = shipment;
    const asdOption: any = <AsendiaOption>shipment.options || {};
    const { accountInfo: account, productCode } = channelConfig;
    const orderCustoms = parcel.items.map(item => ({
      Description: item.description.replace(/[\u4e00-\u9fa5]/g, ''),
      DescriptionCn: item.description,
      Qty: item.quantity,
      Weight: item.weight,
      Value: item.value,
      Length: '',
      Width: '',
      Height: '',
      TaxCode: '',
      HsCode: item.hsCode,
      OriginLocationCode: item.originCountry,
    }));
    const body = {
      ApiToken: account.ApiToken,
      OrderList: [
        {
          // M
          OrderNumber: TransporterUtils.uuid23(),
          TrackingNo: '',
          // M
          ServiceType: productCode || 'EPAQPLS-LPDSA', // TODO 和产品确认这个是不是产品代码,转换成渠道配置
          // M
          Consignee: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
          // M
          Address1: `${receiverAddress.street1} ${receiverAddress.street2 || ''} ${receiverAddress.street3 || ''} `, // asendia没有地址长度限制会把所有地址显示到面单上,但是Address3不会出现在面单上,所以暂时把所有地址拼到address1上
          // Address2: receiverAddress.street2,
          // Address3: receiverAddress.street3,
          // M
          City: receiverAddress.city,
          // M
          CountryCode: receiverAddress.countryCode,
          // M
          ConsigneePhone: TransporterUtils.getPhoneNumber(receiverAddress),
          // M Either email or phone number must be populated.
          Email: receiverAddress.email,
          // M
          Zip: receiverAddress.postalCode,
          // M
          State: receiverAddress.city,
          // M
          ShipperName: `${senderAddress.firstName} ${senderAddress.lastName}`,
          // M
          ShipperTel: TransporterUtils.getPhoneNumber(senderAddress),
          // M ShipperTel or ShipperEmail 必须存在一个
          ShipperEmail: senderAddress.email,
          // M
          ShipperCountry: senderAddress.countryCode,
          // M
          ShipperCity: senderAddress.city.substring(0, 7),
          // M
          ShipperAddress1: TransporterUtils.streetsToString(senderAddress),
          // M
          ShipperZipCode: senderAddress.postalCode,
          // M
          ShipperState: 'P',
          // M Country of origin of the goods
          OriginLocationCode: senderAddress.countryCode,
          // M Total weight of all the same articles. The weight includes the direct packaging protecting the article itself.
          Weight: parcel.weight,
          Height: '15',
          Width: '15',
          Length: '15',
          // M Customs Type of item (Gift, Document, Sample or Others)
          CustomsType: 'O',
          // M For example, “Women’s cotton trousers”
          Description: parcel.reference,
          // M Total declared value2 of all the same articles 1 incl. postage (you may enter postage as separate entry by adding a separate line with description postage).
          Value: '10', // !!! 接口已变为可选, 猜测使用PostagePrice和PostageCurrency 代替
          // M
          Currency: 'USD', // TODO  !!! 接口已变为可选, 猜测使用PostagePrice和PostageCurrency 代替
          PostagePrice: asdOption.postagePrice || 2,
          PostageCurrency: asdOption.postageCurrency || 'EUR',
          // M Quantity of goods
          Qty: '1',
          Quantity: '1',
          OrderCustoms: orderCustoms,
        },
      ],
    };
    const requestOptions = {
      uri: channelConfig.shipmentUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      json: true,
      body: body,
      timeout: 7000,
    };
    const response = await request(requestOptions);
    const result = response && response.Result && response.Result[0];
    if (!result) {
      throw new TransporterException('Asendia', 'unknown error', requestOptions);
    }
    if (result.Error) {
      throw new TransporterException('Asendia', result.Error, requestOptions);
    }
    result.transporterRequest = JSON.stringify(requestOptions);
    result.transporterResponse = JSON.stringify(response);
    return result;
  }

  public async getLabel({ trackingNumber, account, labelFormat }): Promise<string> {
    // await new Promise(resolve => setTimeout(resolve, 1000));
    const url = 'http://api.asendiahk.com/openapi/user/1.2/printOrder';
    const body = {
      ApiToken: account.ApiToken,
      LabelFormat: labelFormat.value,
      OutPutFormat: labelFormat.labelType,
      PrintCustoms: true,
      OrderList: [
        {
          TrackingNo: trackingNumber,
        },
      ],
    };

    const requestOptions = {
      uri: url,
      method: 'POST',
      body: body,
      json: true,
      timeout: 7000,
    };

    let buffer: Buffer;
    try {
      buffer = await TransporterUtils.getBuffer(requestOptions);
    } catch (e) {
      throw new TransporterException('Asendia', e.message);
    }

    try {
      await PDFUtils.checkAsendiaLabel(buffer, trackingNumber);
    } catch (e) {
      Logger.error('Asendia label error!');
      Logger.error(`${trackingNumber} : ${buffer.toString('base64')}`);
      throw new TransporterException('Asendia', e.message);
    }

    return buffer.toString('base64');
  }

  /**
   * TODO url进入配置
   * @param trackingNumberArray 可以接受多个跟踪号
   * @return {Promise<*>}
   */
  async fetchTrackingUnofficial({ trackingNumberArray }) {
    // OMS的 ASENDIA_FR_UNTRACK 线路的包裹导入到 CMS 后也会被抓取轨迹。因此过滤。如果传参 全 是上述单号，会得到404异常
    // 检查过2021年以来Asendia的单号都是13位，ASENDIA_FR_UNTRACK的单号是自己构造的是15位
    trackingNumberArray = trackingNumberArray.filter(trackingNumber => trackingNumber.length === 13);
    const trackingArray = [];
    if (!trackingNumberArray || !trackingNumberArray.length) {
      return trackingArray;
    }
    console.log('ASENDIA:' + trackingNumberArray[0] + '开始爬取');

    const agent = getHttpAgent();
    try {
      for (const chunkData of _.chunk(trackingNumberArray, 5)) {
        const result = (
          await axios.request({
            url: 'https://track.asendia.com/api/1.0/branded-url/branded-parcel-search?sort=shipment_date',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Host: 'track.asendia.com',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
              'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
              Accept: 'application/json',
              'Accept-Encoding': 'gzip, deflate, br',
            },
            data: {
              ids: chunkData,
              id: 1,
              subsidiary: ['Asendia HQ'],
              subsidiary_id: [1],
              brand_id: '*',
            },
            httpAgent: agent,
            httpsAgent: agent,
          })
        ).data;

        const array = _.flatMapDeep(
          result.data.map(parcelTracking => {
            const trackingNumber = parcelTracking.tracking_id;
            return parcelTracking.events
              .filter(event => !!event.harmonized_code)
              .map(item => {
                return {
                  trackingNumber,
                  event: item.harmonized_code,
                  description: item.event_raw_desc,
                  timestamp: new Date(item.event_time),
                  location: item.location_name || '',
                  fromFile: false,
                };
              });
          }),
        );
        trackingArray.push(...array);
        await delay(3000);
        console.log(trackingArray.length);
      }
    } catch (e) {
      console.error(e.response?.data || e.message);
      throw e;
    }
    console.log('ASENDIA:' + trackingNumberArray[0] + '爬取结束');
    return trackingArray;
  }
}
