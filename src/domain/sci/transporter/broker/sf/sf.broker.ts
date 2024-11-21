import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse, CancelParcelDto } from '@/domain/ord/parcel/dto';
import { Injectable } from '@nestjs/common';
import { XMLParser } from '@/domain/sci/transporter/broker/sf/XmlParser';
import * as crypto from 'crypto';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import xml2js from 'xml2js';
import moment from 'moment/moment';
import { SfOption } from '@/domain/sci/transporter/broker/sf/sf.option';
import _ from 'lodash';
import { TransporterException } from '@/app/exception/transporter-exception';
import Axios from 'axios';

@Injectable()
export class SfBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const accountInfo = channelConfig.accountInfo;
    const customerCode = accountInfo.customerCode;
    const checkWord = accountInfo.checkWord;
    const xmlString = this._buildXmlString(shipment, channelConfig);
    const data = Buffer.from(xmlString).toString('base64');
    const md5 = crypto
      .createHash('md5')
      .update(xmlString + checkWord)
      .digest('hex');
    const validateStr = Buffer.from(md5).toString('base64');

    const soapData = {
      data,
      validateStr,
      customerCode,
    };

    const soapOption = {
      wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
      url: channelConfig.shipmentUrl,
      timeout: 30 * 1000,
    };
    const client: any = await new Soap().createClient(soapOption);
    let responses: any;
    try {
      responses = await client['sfexpressServiceAsync'](soapData);
    } catch (e) {
      throw new TransporterException('SF', e.message, client.lastRequest);
    }
    /**
     {
        "Response": {
          "$": {
            "service": "OrderWebService"
          },
          "Head": "OK",
          "Body": {
            "OrderResponse": {
              "customerOrderNo": "201602250001",
              "mailNo": "SF1303275921011",
              "originCode": "JFK",
              "destCode": "755",
              "printUrl": "http://osms.sf-express.com/osms/wbs/print/printOrder.pub?mailno=gJqPWLwNHO0FmxqYokowUw==",
              "invoiceUrl": "http://osms.sf-express.com/osms/wbs/print/printInvoice.pub?mailno=gJqPWLwNHO0FmxqYokowUw=="
            }
          }
        }
      }
     */
    const response: any = new XMLParser().parseXmlString2Obj(responses[0].Return);
    if ('OK' === response.Response.Head) {
      const body = response.Response.Body.OrderResponse;
      let labelBase64;
      if (body?.printUrl) {
        labelBase64 = await Axios.get(body.printUrl, { responseType: 'arraybuffer' }).then(response =>
          Buffer.from(response.data, 'binary').toString('base64'),
        );
      }

      return {
        trackingNumber: body.mailNo,
        shippingNumber: body.mailNo,
        label: labelBase64,
        invoice: '',
        labelUrl: body.printUrl,
        invoiceUrl: body.invoiceUrl,
        labelFormat: channelConfig.labelFormat.labelType,
        transporterRequest: xmlString,
        transporterResponse: responses[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<'),
      };
    } else if ('ERR' === response.Response.Head) {
      throw new TransporterException('SF', response.Response.ERROR._, client.lastRequest);
    }
  }

  async searchShipmentInfo(reference, channelConfig: BaseConfig) {
    const accountInfo = channelConfig.accountInfo;
    const customerCode = accountInfo.customerCode;
    const checkWord = accountInfo.checkWord;
    const xmlString = this._buildSearchRequestXML(reference, accountInfo);
    const data = Buffer.from(xmlString).toString('base64');
    const md5 = crypto
      .createHash('md5')
      .update(xmlString + checkWord)
      .digest('hex');
    const validateStr = Buffer.from(md5).toString('base64');

    const soapData = {
      data,
      validateStr,
      customerCode, // 'OSMS_1',
    };

    const soapOption = {
      wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
      url: channelConfig.shipmentUrl,
    };
    const client: any = await new Soap().createClient(soapOption);
    const responses: any = await client['sfexpressServiceAsync'](soapData);

    const response: any = new XMLParser().parseXmlString2Obj(responses[0].Return);
    if ('OK' === response.Response.Head) {
      const body = response.Response.Body.OrderResponse;
      return body;
    } else if ('ERR' === response.Response.Head) {
      throw new TransporterException('SF', response.Response.ERROR._);
    }
  }

  /**
   * 顺丰获取轨迹信息接口
   * @param trackingNumber 由逗号分隔的字符串一次最多10个trackingNumber
   * @param accountInfo
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }): Promise<any[]> {
    const trackingArray = [];
    const soapOption = {
      wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
      url: `http://osms.sf-express.com/osms/services/OrderWebService`,
    };
    const client: any = await new Soap().createClient(soapOption);
    const promises = _.chunk(trackingNumberArray, 10).map(async chunkTrackingNumberArray => {
      const request = {
        $: {
          service: 'RouteService',
          lang: 'zh-CN',
        },
        Head: accountInfo.customerCode,
        Body: {
          Route: {
            $: {
              tracking_type: 1,
              tracking_number: chunkTrackingNumberArray.join(','),
            },
          },
        },
      };
      const xmlString = new xml2js.Builder().buildObject({ Request: request });
      const data = Buffer.from(xmlString).toString('base64');
      const md5 = crypto
        .createHash('md5')
        .update(xmlString + accountInfo.checkWord)
        .digest('hex');
      const validateStr = Buffer.from(md5).toString('base64');

      const soapData = {
        data,
        validateStr,
        customerCode: accountInfo.customerCode,
      };

      const responseBody = await client['sfexpressServiceAsync'](soapData);

      const response = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(responseBody[0].Return);
      if (response.Response.Head !== 'OK') {
        throw new TransporterException('SF', `${response.Response.ERROR.$.code}:${response.Response.ERROR._}`);
      }
      let body = response.Response.Body.RouteResponse;
      if (!_.isArray(body)) {
        body = [body];
      }
      trackingArray.push(..._.flattenDeep(body.map(item => this._toTracking(item))));
    });
    await Promise.all(promises);
    return trackingArray;
  }

  async cancelShipment(dto: CancelParcelDto, config) {
    const request = {
      $: {
        service: 'CancelOrderService',
        lang: 'zh-CN',
      },
      Head: config.accountInfo.customerCode,
      Body: {
        CancelOrder: {
          $: {
            mailno: dto.shippingNumber,
          },
        },
      },
    };
    const xmlString = new xml2js.Builder().buildObject({ Request: request });
    const data = Buffer.from(xmlString).toString('base64');
    const md5 = crypto
      .createHash('md5')
      .update(xmlString + config.accountInfo.checkWord)
      .digest('hex');
    const validateStr = Buffer.from(md5).toString('base64');

    const soapData = {
      data,
      validateStr,
      customerCode: config.accountInfo.customerCode,
    };

    const soapOption = {
      wsdl: `${process.cwd()}/src/assets/wsdl/sf/SF.wsdl`,
      url: `http://osms.sf-express.com/osms/services/OrderWebService`,
    };
    const client: any = await new Soap().createClient(soapOption);

    const responseBody = await client['sfexpressServiceAsync'](soapData);
    const response = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(responseBody[0].Return);
    if (response.Response.CancelOrderResponse.$.result === 'true') {
      return '订单已取消成功';
    } else {
      return `错误码:${response.Response.CancelOrderResponse.$.code} ${response.Response.CancelOrderResponse.$.message}`;
    }
  }

  // async handleTracking(parcel, trackingArray) {
  //   for (const tracking of trackingArray) {
  //     parcel.lastEvent = tracking.event;
  //     parcel.lastTimestamps = tracking.timestamp;
  //     parcel.lastDescription = tracking.description;
  //
  //     if (!parcel.transferredAt && ['655', '50'].includes(tracking.event)) {
  //       parcel.transferredAt = tracking.timestamp;
  //       parcel.status = 'DELIVERING';
  //     }
  //     if (!parcel.arrivedAt && '80' === tracking.event) {
  //       parcel.arrivedAt = tracking.timestamp;
  //       parcel.status = 'ARRIVED';
  //       parcel.isArrived = true;
  //     }
  //
  //     if (parcel.transferredAt && parcel.arrivedAt) {
  //       const aging = moment.duration(parcel.arrivedAt - parcel.transferredAt, 'ms').asDays();
  //       parcel.aging = _.round(aging, 1);
  //     }
  //   }
  //   return parcel;
  // }

  async modifyShipment(shipment: CreateClientDto, channelConfig: BaseConfig) {
    return this.create(shipment, channelConfig);
  }

  _buildXmlString(shipment, channelConfig: BaseConfig) {
    const accountInfo = channelConfig.accountInfo;
    const customerCode = accountInfo.customerCode;
    const parcel = shipment.parcel;
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const sfOption = <SfOption>shipment.options;
    const cargos = [];
    //TODO keminfeng 如果没有传Item
    parcel.items.forEach(item => {
      const cargo = {
        $: {
          name: item.description,
          count: item.quantity,
          amount: item.value,
          // currency: 'CNY',
          source_area: item.originCountry,
          // brand: 'Gallia佳丽雅',
          unit: '件(pcs)',
          weight: item.weight,
        },
      };
      cargos.push(cargo);
    });
    // 将要转为 xml 的对象
    const Request = {
      $: {
        // 测试环境不支持 ReConfrimWeightOrder
        service: 'OSMS_1' === customerCode ? 'apiOrderService' : 'ReConfrimWeightOrder',
        lang: 'zh_CN',
      },
      Head: customerCode,
      Body: {
        Order: {
          $: {
            reference_no1: parcel.reference,
            // 固定值 602
            express_type: channelConfig.productCode,
            pay_method: '1',
            // 固定值
            currency: 'CNY',
            j_company: senderAddress.company,
            j_contact: `${senderAddress.firstName} ${senderAddress.lastName}`,
            j_tel: senderAddress.mobileNumber || senderAddress.phoneNumber,
            j_address: senderAddress.street1 + senderAddress.street2 + senderAddress.street3,
            // 固定值
            j_country: senderAddress.countryCode,
            j_province: senderAddress.province,
            j_city: senderAddress.city,
            j_post_code: senderAddress.postalCode,
            d_company: receiverAddress.company,
            d_contact: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
            d_address: receiverAddress.street1 + receiverAddress.street2 + receiverAddress.street3,
            d_tel: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
            d_country: receiverAddress.countryCode,
            d_province: receiverAddress.province,
            d_city: receiverAddress.city,
            // d_county: '灌阳县',
            d_post_code: receiverAddress.postalCode,
            // 月结卡号
            custid: accountInfo.custId,
            // 税金付款方式1：寄付,2：到付,3：第三方
            tax_pay_type: sfOption.taxPayType,
            express_reason: '2',
            // Label Format
            printSize: channelConfig.labelFormat.value,
            j_shippercode: sfOption.shipperCode,
            // 改单参数
            is_change_order: sfOption.isChangeOrder || '1',
            operate_type: sfOption.isChangeOrder || '1',
            order_cert_type: sfOption.orderCertType,
            order_cert_no: sfOption.orderCertNo,
            realweightqty: sfOption.realWeight,
            volumeweightqty: sfOption.volumeWeight,
            meterageweightqty: sfOption.meterageWeight,
            customs_batchs: sfOption.customsBatch,
            rec_userno: sfOption.operatorNo,
          },
          Cargo: cargos,
        },
      },
    };
    return new xml2js.Builder().buildObject({ Request });
  }

  _buildSearchRequestXML(reference, accountInfo) {
    // 将要转为 xml 的对象
    const Request = {
      $: {
        service: 'OrderSearchService',
        lang: 'zh_CN',
      },
      Head: accountInfo.customerCode,
      Body: {
        OrderSearch: {
          $: {
            orderid: reference,
          },
        },
      },
    };
    return new xml2js.Builder().buildObject({ Request });
  }

  _toTracking(item) {
    if (item._ && item._ === '该订单号没路由信息') {
      return [];
    }
    if (!_.isArray(item.Route)) {
      item.Route = item.Route ? [item.Route] : [];
    }
    const trackingNumber = item.$.mailno;
    return item.Route.map(eachRoute => {
      return {
        trackingNumber,
        timestamp: moment(eachRoute.$.accept_time, 'YYYY-MM-DD HH:mm:ss')
          .add(-eachRoute.$.zoneGmt, 'hour')
          .utc(true)
          .toDate(),
        event: eachRoute.$.opcode,
        location: eachRoute.$.accept_address,
        description: eachRoute.$.remark,
      };
    });
  }
}
