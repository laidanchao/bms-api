import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import axios from 'axios';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import crypto from 'crypto';
import qs from 'qs';
import { ExpOption } from '@/domain/sci/transporter/broker/exp/exp.option';
import { TransporterException } from '@/app/exception/transporter-exception';
import { CancelParcelDto } from '@/domain/ord/parcel/dto';
import _ from 'lodash';
import { Logger } from '@/app/logger';
import moment from 'moment-timezone';

export class ExpBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const path = '/api/order/create';
    const method = 'exp.receive.bjorder.create';
    const data = this.buildData(shipment, channelConfig);
    const param = this.encodeData(channelConfig.accountInfo.appId, channelConfig.accountInfo.appSecret, method, data);
    const response = await this.postRequest(`${channelConfig.shipmentUrl}${path}`, param);

    if (response.data.code !== '10000') {
      throw new TransporterException('Exp', response.data.sub_msg, param);
    }
    const result = response.data.body;
    return {
      trackingNumber: result.mail_no,
      shippingNumber: result.expno,
      label: '',
      invoice: '',
      labelUrl: result.pdf,
      invoiceUrl: '',
      labelFormat: channelConfig.labelFormat.labelType,
      transporterRequest: JSON.stringify(param),
      transporterResponse: JSON.stringify(response.data),
    };
  }

  /**
   * 派送商特殊 传入的trackingNumber实际上为shippingNumber
   *
   * @param trackingNumberArray
   * @param accountInfo
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const shippingNumberArray = trackingNumberArray;
    const responseArray = [];
    for (const shippingNumberChunk of _.chunk(shippingNumberArray, 100)) {
      const chunkResponseArray = [];
      const promises = _.chunk(shippingNumberChunk, 10).map(async chunk => {
        const data = {
          dno: accountInfo.dno,
          // 最大10个
          orderList: chunk.map(shippingNumber => {
            return {
              // trade_no: 'reference',
              // expno: 'shippingNumber'
              expno: shippingNumber,
            };
          }),
        };
        const param = this.encodeData(accountInfo.appId, accountInfo.appSecret, 'exp.logistics.track.get', data);
        try {
          const response = await this.postRequest('http://121.41.56.246:6202/api/track/search', param);
          chunkResponseArray.push(response);
        } catch (e) {
          Logger.warn('Exp fetchTracking: ' + e.message);
        }
      });
      await Promise.all(promises);
      responseArray.push(...chunkResponseArray);
    }

    const bodyArray = _.flatMapDeep(
      responseArray
        .filter(response => response.status === 200)
        .map(response => response.data)
        .filter(data => data.code === '10000')
        .map(data => data.body),
    ).filter(body => body.sub_code);

    return _.flatMapDeep(
      bodyArray.map(body => {
        return body.traces.map(trace => {
          return {
            trackingNumber: body.mail_no,
            reference: body.trade_no,
            event: trace.accept_code,
            timestamp: moment.tz(trace.accept_time, 'Asia/Shanghai').toDate(),
            description: `${trace.accept_name}_${trace.accept_station}`,
            fromFile: false,
          };
        });
      }),
    );
  }

  /**
   * TODO 没写完 派送商说不要对接了 缺少path
   * @param cancelParcelDto
   * @param channelConfig
   */
  async cancelShipment(cancelParcelDto: CancelParcelDto, channelConfig: BaseConfig) {
    const accountInfo = channelConfig.accountInfo;
    const method = 'exp.order.cancel';
    const path = '';
    const data = {
      dno: accountInfo.dno,
      cancel_type: '10',
      // shippingNumber
      order_code: cancelParcelDto.shippingNumber,
      reason: 'cancelParcelDto.reason',
    };
    const param = this.encodeData(accountInfo.appId, accountInfo.appSecret, method, data);
    const response = await this.postRequest(`${channelConfig.shipmentUrl}${path}`, param);
    return response;
  }

  private async postRequest(url, param) {
    const option: any = {
      url,
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(param),
      timeout: 10000,
    };
    return await axios.request(option);
  }

  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const accountInfo = channelConfig.accountInfo;
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const parcel = shipment.parcel;
    const option = <ExpOption>shipment.options;

    const data = {
      dno: accountInfo.dno,
      // source: '',
      // business_model: '',
      // mail_no: '',
      // tran_no: '',
      // logistics_id: '',
      // seller_id: '',
      // order_create_time: shipment.shippingDate,
      // storehouse_id: '',
      // expno: '',
      trade_no: parcel.reference,
      // tid: '',
      // package_no: '',
      // payment_enterprise: '',
      // payment_enterprise_name: '',
      // payment_transaction: '',
      // payment_time: '',
      // payment_remark: '',
      // out_way_bill_url: '',
      // declare_scheme_sid: '',
      product_code: channelConfig.productCode,
      // cp_code: '',
      // total_freight: '',
      // total_code: '',
      // 保险
      // premium_fee: shipment.parcel.insuranceValue,
      // premium_code: '',
      // totai_taxes_reference: '',
      // totai_code: '',
      // discount_fee: '',
      // discount_code: '',
      // net_weight: '',
      itemsum_weight: parcel.weight,
      // bill: '',
      // platform: '',
      // is_trace_source: '',
      // zcode: '',
      // totai_taxes_pay: '',
      // totai_pay_code: '',
      // remark: '',
      sender: {
        name: TransporterUtils.getFullName(senderAddress),
        phone: senderAddress.phoneNumber,
        mobile: senderAddress.mobileNumber,
        country: senderAddress.countryCode,
        province: senderAddress.province,
        city: senderAddress.city,
        // county: '',
        address: `${senderAddress.street1 || ''} ${senderAddress.street2 || ''} ${senderAddress.street3 || ''}`,
        zip_code: senderAddress.postalCode,
      },
      receiver: {
        name: TransporterUtils.getFullName(receiverAddress),
        phone: receiverAddress.phoneNumber,
        mobile: receiverAddress.mobileNumber,
        identity_no: option.receiverId,
        // identity_no_front: '',
        // identity_no_back: '',
        country: receiverAddress.countryCode,
        province: receiverAddress.province,
        city: receiverAddress.city,
        // county: '',
        address: `${receiverAddress.street1 || ''} ${receiverAddress.street2 || ''} ${receiverAddress.street3 || ''}`,
        zip_code: receiverAddress.postalCode,
      },
      // buyer: {
      //   name: '',
      //   phone: '',
      //   mobile: '',
      //   id_type: '',
      //   identity_no: '',
      // },
      itemList: parcel.items.map(item => {
        return {
          // index: '',
          // item: '',
          // wms_batch: '',
          // batch: '',
          item_name: item.description,
          // item_enname: '',
          item_category: item.category,
          hscode: item.hsCode,
          // cust_no: '',
          // ciq_no: '',
          item_quantity: item.quantity,
          item_net_weight: item.weight,
          item_weight: item.weight,
          price_declare: item.value,
          price_code: 'CNY',
          unit: 'kg',
          // unit1: '',
          // qty1: '',
          // unit2: '',
          // qty2: '',
          // brand: '',
          // item_tax: '',
          assem_country: item.originCountry,
          // assem_area: '',
          // spec: '',
          // bar_code: '',
          // oid: '',
          // nots: '',
        };
      }),
    };
    return data;
  }

  private encodeData(appId, appSecret, method, data) {
    const param = {
      app_id: appId,
      charset: 'utf-8',
      format: 'json',
      method,
      timestamp: Date.now(),
      version: '1.0',
    };

    const str =
      Object.keys(param)
        .map(key => `${key}=${param[key]}`)
        .join('&') + appSecret;
    param['sign'] = crypto
      .createHash('md5')
      .update(str)
      .digest('hex')
      .toUpperCase();
    param['sign_type'] = 'md5';
    param['biz_content'] = JSON.stringify(data);

    return param;
  }
}
