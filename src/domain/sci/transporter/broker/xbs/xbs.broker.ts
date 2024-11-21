import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import _ from 'lodash';
import request from 'request-promise';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import { XbsOption } from '@/domain/sci/transporter/broker/xbs/xbs.option';
import { BusinessException } from '@/app/exception/business-exception';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import moment from 'moment-timezone';

@Injectable()
export class XbsBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { shipmentUrl: url, accountInfo: account, labelFormat } = channelConfig;
    const { senderAddress, receiverAddress, parcel } = shipment;
    const xbsOptions = <XbsOption>shipment.options;

    if (!parcel.items) {
      throw new BusinessException('parcel 中必须包含 items 参数');
    }

    const data = {
      Apikey: account.ApiKey, // Accès API :  FTLEXPRESS
      Command: 'OrderShipment',
      Shipment: {
        LabelFormat: labelFormat.value, // TODO XBS文档确认面单格式
        ShipperReference: parcel.reference,
        Service: channelConfig.productCode, //PostNL Parcel GlobalPack EMS // TODO 确认xbs的产品
        ConsignorAddress: {
          Name: TransporterUtils.getFullName(senderAddress),
          Company: senderAddress.company,
          AddressLine1: senderAddress.street1,
          AddressLine2: senderAddress.street2,
          AddressLine3: senderAddress.street3,
          City: senderAddress.city,
          State: senderAddress.province,
          Zip: senderAddress.postalCode,
          Country: senderAddress.countryCode,
          Phone: TransporterUtils.getPhoneNumber(senderAddress),
          Email: senderAddress.email,
        },
        ConsigneeAddress: {
          Name: TransporterUtils.getFullName(receiverAddress),
          Company: receiverAddress.company,
          AddressLine1: receiverAddress.street1,
          AddressLine2: receiverAddress.street2,
          AddressLine3: receiverAddress.street3,
          City: receiverAddress.city,
          State: receiverAddress.province,
          Zip: receiverAddress.postalCode,
          Country: receiverAddress.countryCode,
          Phone: TransporterUtils.getPhoneNumber(receiverAddress),
          Email: receiverAddress.email,
          NationalId: '',
          TaxId: '',
          PassportNumber: '',
          PassportIssueDate: '',
          PassportExpiryDate: '',
        },
        PaymentReferenceNumber: '',
        PaymentDateTime: '',
        Weight: parcel.weight,
        WeightUnit: 'kg',
        Length: '15',
        Width: '15',
        Height: '15',
        DimUnit: 'cm',
        Value:
          parcel.value ||
          _.round(
            MathCalculator.sumBy(parcel.items, item => MathCalculator.mul(item.value, item.quantity)),
            2,
          ),
        Currency: 'EUR',
        CustomsDuty: 'DDU',
        Description: 'goods',
        Products: formatProductArray(parcel.items),
        DeclarationType: xbsOptions.declarationType || 'SaleOfGoods',
      },
    };

    const auth = 'Basic ' + Buffer.from(account.login + ':' + account.password).toString('base64');
    const requestOptions = {
      uri: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: auth,
      },
      json: true,
      body: data,
      timeout: 10000,
    };

    let response: any;
    try {
      response = await request(requestOptions);
    } catch (err) {
      throw new TransporterException('Xbs', err.message, requestOptions);
    }
    if (response.ErrorLevel === 0) {
      const shippingNumber = response.Shipment.TrackingNumber;
      const trackingNumber = response.Shipment.CarrierLocalTrackingNumber;
      const label = response.Shipment.LabelImage;
      return {
        trackingNumber: trackingNumber,
        shippingNumber: shippingNumber,
        label: label,
        labelFormat: labelFormat.labelType,
        transporterRequest: JSON.stringify(requestOptions),
        transporterResponse: JSON.stringify(response),
      };
    } else {
      throw new TransporterException('XBS', response.Error, requestOptions);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }): Promise<any[]> {
    if (!trackingNumberArray || !trackingNumberArray.length) {
      return [];
    }

    const trackingArray = [];
    const auth = 'Basic ' + Buffer.from(accountInfo.login + ':' + accountInfo.password).toString('base64');
    for (const trackingNumber of trackingNumberArray) {
      const requestOptions = {
        // 生产地址
        uri: 'https://mtapi.net/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: auth,
        },
        json: true,
        body: {
          Apikey: accountInfo.ApiKey,
          Command: 'TrackShipment',
          Shipment: {
            TrackingNumber: trackingNumber,
          },
        },
      };
      try {
        const response = await request(requestOptions);
        if (!response.Shipment?.Events) {
          continue;
        }
        const trackings = response.Shipment.Events.map(rawTracking => {
          return {
            trackingNumber,
            //TODO 到了夏令时再次检查时区是否为+2 目前冬令时为+1 在官网(https://postnl.post/)查包裹轨迹对比时间
            timestamp: moment.tz(rawTracking.DateTime, 'YYYYMMDD HHmmss', 'Europe/Paris').toDate(),
            event: rawTracking.Code,
            description: rawTracking.CarrierDescription || rawTracking.Description,
            location: rawTracking.Country,
            fromFile: false,
          };
        });
        trackingArray.push(...trackings);
      } catch (err) {
        console.error(`XBS: ${err.message}`);
      }
    }
    return trackingArray;
  }
}

function formatProductArray(items) {
  return items.map(item => {
    return {
      Description: item.description,
      Sku: item.sku || '',
      HsCode: item.hsCode || '',
      OriginCountry: item.originCountry,
      PurchaseUrl: item.purchaseUrl || '',
      Quantity: item.quantity,
      Value: _.round(MathCalculator.mul(Number(item.quantity), Number(item.value)), 2),
    };
  });
}
