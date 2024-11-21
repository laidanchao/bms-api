import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';
import { LaposteTracking } from '@/domain/sci/transporter/broker/common/laposte-tracking';
import { Transporter } from '@/domain/utils/Enums';
import Axios from 'axios';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';

export class HkaceBroker extends TransporterBroker {
  // 下单
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const randomNum = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    shipment.parcel.reference = shipment.parcel.reference || `REF_${new Date().getTime().toString()}_${randomNum}`;
    const newReference = this.referenceHandle(shipment.parcel.reference);
    const createdData = this.buildData(shipment, channelConfig, newReference);
    const { appToken, appKey } = channelConfig.accountInfo;
    // 格式化请求体
    const baseParam = {
      appToken,
      appKey,
    };
    const createdParam = {
      ...baseParam,
      serviceMethod: 'createorder',
      paramsJson: JSON.stringify(createdData),
    };

    try {
      const { data } = await this.postRequest(`${channelConfig.shipmentUrl}`, createdParam);

      if (data.success !== 1) {
        throw new Error(data.enmessage);
      }
      const labelUrl = await this._getLabelUrl(channelConfig, baseParam, newReference);
      const labelBase64 = await Axios.get(labelUrl, { responseType: 'arraybuffer' }).then(response =>
        Buffer.from(response.data, 'binary').toString('base64'),
      );
      const drawLabel = await new PdfUtil().drawHKAceCirCleText(labelBase64, 'F', shipment.parcel.reference);
      return {
        trackingNumber: data.data.channel_hawbcode,
        shippingNumber: data.data.channel_hawbcode,
        label: drawLabel,
        labelUrl: labelUrl,
        labelFormat: channelConfig.labelFormat.labelType,
        transporterRequest: JSON.stringify(createdParam),
        transporterResponse: JSON.stringify(data),
        reference: shipment.parcel.reference,
      };
    } catch (e) {
      const error = e?.message || JSON.stringify(e);
      console.log(e);

      if (
        error.includes('CNGDF_G_GSR_API_RESULT_FAIL') ||
        error.includes('apollo_fulfill-oms#biz-routeApiResultEmpty-E')
      ) {
        throw new TransporterException('COLISSIMO', '收件邮编不在派送范围内', createdParam);
      } else {
        //hkace报错，前缀改成COLISSIMO
        throw new TransporterException(
          'COLISSIMO',
          error.replace(/hkace/gi, '').replace(/alibaba/gi, ''),
          createdParam,
        );
      }
    }
  }

  async _getLabelUrl(channelConfig, baseParam, newReference) {
    const requestParam = {
      ...baseParam,
      serviceMethod: 'getnewlabel',
      paramsJson: JSON.stringify({
        configInfo: {
          lable_file_type: '2',
          lable_paper_type: '1',
          lable_content_type: '1',
          additional_info: {
            lable_print_invoiceinfo: 'Y',
            lable_print_buyerid: 'N',
            lable_print_datetime: 'Y',
            customsdeclaration_print_actualweight: 'N',
          },
        },
        listorder: [
          {
            reference_no: newReference,
          },
        ],
      }),
    };
    const { data } = await this.postRequest(`${channelConfig.shipmentUrl}`, requestParam);
    if (data.success !== 1) {
      throw new Error(data.enmessage);
    }
    return data.data[0].lable_file;
  }

  // 格式化报文内容
  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig, reference: string) {
    const { senderAddress, receiverAddress, parcel } = shipment;
    const createSenderAddress =
      channelConfig.platform === 'FTL-OMS'
        ? {
            firstName: null,
            lastName: 'FTL',
            street1: 'changhe road',
            street2: null,
            street3: '',
            city: 'hangzhou',
            province: 'zhejiang',
            postalCode: '322100',
            countryCode: 'CN',
            company: '',
            email: 'no-reply@ftl-express.cn',
            mobileNumber: null,
            phoneNumber: '3631',
          }
        : senderAddress;
    const data: any = {
      reference_no: reference,
      shipping_method: channelConfig.productCode,
      order_weight: parcel.weight,
      shipper: {
        shipper_name: TransporterUtils.getFullName(createSenderAddress),
        shipper_company: createSenderAddress.company,
        shipper_countrycode: createSenderAddress.countryCode,
        shipper_province: createSenderAddress.province,
        shipper_city: createSenderAddress.city,
        shipper_street: TransporterUtils.streetsToString(createSenderAddress),
        shipper_postcode: createSenderAddress.postalCode,
        shipper_telephone: createSenderAddress.phoneNumber,
        shipper_mobile: createSenderAddress.mobileNumber,
        shipper_email: createSenderAddress.email,
        shipper_tariff: '',
      },
      consignee: {
        consignee_name: TransporterUtils.getFullName(receiverAddress),
        consignee_company: receiverAddress.company,
        consignee_countrycode: receiverAddress.countryCode,
        consignee_province: receiverAddress.province,
        consignee_city: receiverAddress.city,
        consignee_street: TransporterUtils.streetsToString(receiverAddress),
        consignee_postcode: receiverAddress.postalCode,
        consignee_telephone: receiverAddress.phoneNumber,
        consignee_mobile: receiverAddress.mobileNumber,
        consignee_email: receiverAddress.email,
      },
      cargovolume: [
        {
          involume_length: parcel.length,
          involume_width: parcel.width,
          involume_height: parcel.height,
          involume_grossweight: parcel.weight,
        },
      ],
    };

    if (!parcel.items || !parcel.items.length) {
      data.invoice = [
        {
          invoice_enname: 'description',
          invoice_cnname: 'description',
          invoice_quantity: 1,
          invoice_unitcharge: 10,
        },
      ];
    } else {
      data.invoice = parcel.items.map(it => {
        return {
          sku: it.sku,
          invoice_enname: it.description,
          invoice_cnname: it.description,
          invoice_quantity: it.quantity,
          invoice_unitcharge: it.value,
          hs_code: it.hsCode,
          country_origin: it.originCountry,
        };
      });
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
