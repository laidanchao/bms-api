import { TransporterException } from '@/app/exception/transporter-exception';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { delay } from '@/domain/utils/util';
import { Logger } from '@nestjs/common';
import { DispeoOption } from '@/domain/sci/transporter/broker/dispeo/dispeo.option';
import { Agent } from 'https';
import { Density, PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';

export class DispeoBroker extends TransporterBroker {
  private BaseUrl = process.env.NODE_ENV.includes('production')
    ? 'https://ws-tms-ext.dispeo.com/ws-editique-public'
    : 'https://ws-tms-ext-rec.dispeo.com/ws-editique-public';

  private Token;

  /**
   * 下单
   * @param shipment
   * @param channelConfig
   */
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const data = this.buildData(shipment, channelConfig);
    this.Token = channelConfig.accountInfo.token;

    try {
      const response = await this.postRequest(`${channelConfig.shipmentUrl}`, data);

      if (response.ErrorId > 0) {
        throw new Error(response.ErrorMessage);
      }

      const { Shipments } = response;
      const result: any = await Promise.all(
        Shipments.map(async m => {
          let scaledPdf;
          if (channelConfig.labelFormat.code === 'A6_PDF') {
            scaledPdf = await new PdfUtil().convertZplToPdf(
              Buffer.from(m.LabelContent, 'base64'),
              Density.DPI203,
              4,
              6,
            );
          }

          return {
            trackingNumber: m.TrackingNumber,
            shippingNumber: m.TrackingReference1 || m.TrackingNumber,
            label: scaledPdf || m.LabelContent,
            labelFormat: channelConfig.labelFormat.labelType,
            reference: shipment.parcel.reference,
            cn23: m?.CustomsDocuments || '',
          };
        }),
      );
      result[0].transporterRequest = JSON.stringify(data);
      result[0].transporterResponse = JSON.stringify(response);
      return result;
    } catch (e) {
      const error = e?.message || JSON.stringify(e);
      console.error(e);
      throw new TransporterException('DISPEO', error, data);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const trackingArray = [];
    this.Token = accountInfo.token;
    const firstTrackingNumber = 'dispeo:' + trackingNumberArray[0];
    console.log(`${firstTrackingNumber}等等${trackingNumberArray.length}个单号开始爬取...`);
    for (const chunkTrackingNumbers of _.chunk(trackingNumberArray, 2)) {
      try {
        const data = {
          LanguageCode: 'fr-FR',
          TrackingNumbers: chunkTrackingNumbers,
        };
        const response = await this.postRequest(`${this.BaseUrl}/api/Tracking/GetStatus`, data, 10000);
        if (response.ErrorId > 0) {
          throw new Error(response.ErrorMessage);
        }

        response.TrackingDetail.map(({ TrackingNumber: trackingNumber, Events }) => {
          Events.map(event => {
            trackingArray.push({
              trackingNumber,
              timestamp: moment.tz(event.DateEvent, 'YYYY-MM-DD HH:mm:ss', 'Europe/Paris').toDate(),
              event: event.CodeEvent,
              description: event.LibelleEvent,
            });
          });
        });
        await delay(2000);
      } catch (e) {
        Logger.error(`DISPEO获取轨迹失败:${e?.message}`, e.stack);
      }
    }
    console.log(firstTrackingNumber, `${firstTrackingNumber}等等,爬取结束!`);

    return trackingArray;
  }

  async cancelShipment(cancelParcel: CancelParcelDto, channelConfig: BaseConfig) {
    this.Token = channelConfig.accountInfo.token;
    try {
      const response = await this.postRequest(`${this.BaseUrl}/api/Shipping/CancelShipment`, {
        TrackingNumbers: cancelParcel.trackingNumbers,
      });
      return response.CancelShipments;
    } catch (e) {
      Logger.error(e);
      throw new TransporterException('', e.message);
    }
  }

  /**
   * 拼接请求数据
   * @param shipment
   * @param channelConfig
   * @private
   */
  private buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const { productCode, labelFormat } = channelConfig;
    const { senderAddress, receiverAddress } = shipment;
    if (shipment.parcel) {
      shipment.parcels = [shipment.parcel];
    }
    const shipmentOption = <DispeoOption>shipment.options;
    const data = {
      OrderReference: shipment.parcel.reference,
      CarrierProductCode: productCode,
      LabelFormat: labelFormat.value,
      From: {
        SenderName: TransporterUtils.getFullName(senderAddress),
        Address1: senderAddress.street1,
        Address2: senderAddress.street2,
        Address3: senderAddress.street3,
        Zipcode: senderAddress.postalCode,
        City: senderAddress.city,
        State: senderAddress.province,
        CountryCode: senderAddress.countryCode,
        Phone: senderAddress.mobileNumber || senderAddress.phoneNumber,
        Email: senderAddress.email,
      },
      To: {
        Company: receiverAddress.company,
        Firstname: receiverAddress.firstName,
        Lastname: receiverAddress.lastName,
        Address1: receiverAddress.street1,
        Address2: receiverAddress.street2,
        Address3: receiverAddress.street3,
        Zipcode: receiverAddress.postalCode,
        City: receiverAddress.city,
        State: receiverAddress.province,
        CountryCode: receiverAddress.countryCode,
        Phone: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
        Email: receiverAddress.email,
        RelayId: shipmentOption.relayPointId,
        RelayCountryCode: shipmentOption.relayCountry,
      },
      Parcels: _.map(shipment.parcels, (parcel, index) => {
        return {
          ParcelNumber: index + 1,
          Weight: _.round((parcel.weight || 1) * 1000, 2),
          Length: _.round((parcel.length || 5) * 10, 2),
          Width: _.round((parcel.width || 5) * 10, 2),
          Height: _.round((parcel.height || 5) * 10, 2),
          InsuranceValue: _.round((parcel.insuranceValue || 0) * 100, 2),
          InsuranceCurrency: 'EUR',
          ShippingFeesValue: shipmentOption.shippingFee || 0,
          ShippingFeesCurrency: 'EUR',
          Products: _.map(parcel.items, item => {
            return {
              Reference: item.sku || '',
              Name: item.description,
              Quantity: item.quantity,
              Weight: _.round((item.weight || 1) * 1000, 2),
              OriginCountryCode: item.originCountry,
              UnitPriceValue: item.value,
              UnitPriceCurrency: 'EUR',
              CustomsCode: item.hsCode,
              Type: item.category,
            };
          }),
          Invoice: '',
          ShippingCategory: shipmentOption.customsCategory,
          DeliveryInstructions: parcel.instructions,
          CustomsInformation: {
            IncotermCode: shipmentOption.incotermCode,
            SenderEORICode: shipmentOption.senderEORICode,
            SenderVATCode: shipmentOption.senderVATCode,
            ReceiverEORICode: shipmentOption.receiverEORICode,
            ReceiverVATCode: shipmentOption.receiverVATCode,
          },
        };
      }),
    };

    return data;
  }

  // post请求封装
  private async postRequest(url, data, timeout = 15000) {
    let httpsAgent = null;
    // 测试环境关闭https证书验证
    if (!process.env.NODE_ENV.includes('production')) {
      httpsAgent = new Agent({
        rejectUnauthorized: false,
      });
    }
    const option: any = {
      url,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `DispeoToken ${this.Token}`,
      },
      data,
      timeout,
      httpsAgent,
    };
    const response = await axios.request(option);
    return response.data;
  }
}
