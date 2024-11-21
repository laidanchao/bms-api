import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import request from 'request-promise';
import _ from 'lodash';
import { ParcelItemDto } from '@/domain/ord/parcel/dto/parcel-item.dto';
import Xml2js from 'xml2js';
import moment from 'moment';
import 'moment-timezone';
import { Injectable } from '@nestjs/common';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { classToPlain } from 'class-transformer';
import { XmlParser } from '@/domain/sci/transporter/broker/common/xml-parser';
import { TransporterException } from '@/app/exception/transporter-exception';
import { Logger } from '@/app/logger';
import axios from 'axios';
import { delay } from '@/domain/utils/util';
import { Transporter } from '@/domain/utils/Enums';

//TODO keminfeng 针对收件地区 进行 包裹数量校验
@Injectable()
export class BeBroker extends TransporterBroker {
  public async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse[]> {
    const body = this._buildXmlString(shipment, channelConfig);
    const options = {
      uri: channelConfig.shipmentUrl,
      method: 'POST',
      body: body,
      timeout: 10000,
    };
    const result = await request(options);
    let resultObject;
    new Xml2js.Parser().parseString(result, (err, result) => {
      resultObject = result.ShipResponse.Result[0];
    });
    if ('true' === resultObject.Success[0]) {
      const shipmentResult: CreateParcelResponse[] = [];
      const packages = resultObject.Packages[0].Package;
      for (let i = 0; i < packages.length; i++) {
        const createParcelResponse: CreateParcelResponse = {
          trackingNumber: packages[i].TrackingNumber[0],
          shippingNumber: packages[i].TrackingNumber[0],
          label: packages[i].LabelImages[0].LabelImage[0],
          labelFormat: channelConfig.labelFormat.labelType,
          transporterRequest: JSON.stringify(options),
          transporterResponse: JSON.stringify(result),
        };
        shipmentResult.push(createParcelResponse);
      }
      return shipmentResult;
    }
    new Xml2js.Parser().parseString(result, (err, result) => {
      resultObject = result.ShipResponse.Errors[0];
    });
    throw new TransporterException('Be', resultObject.Error[0].ErrorMessage[0], options);
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const trackingArray = [];
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 5)) {
      const chunkTrackingArray = [];
      const fetchTrackingPromises = chunkTrackingNumberArray.map(async trackingNumber => {
        const body = {
          Login: {
            Username: accountInfo.username,
            Password: accountInfo.password,
          },
          Test: false,
          ClientID: accountInfo.clientId,
          TrackingNumber: trackingNumber,
          RetrievalType: 'Historical',
        };
        const option = {
          uri: 'https://api.landmarkglobal.com/v2/Track.php',
          method: 'POST',
          body: new Xml2js.Builder().buildObject({ TrackRequest: body }),
        };
        const resultXmlString = await request(option);
        const resultObject: any = new XmlParser().parseXmlString2Obj(resultXmlString);
        if (resultObject.TrackResponse.Errors) {
          Logger.error(
            `Be fetchTracking error: ${resultObject.TrackResponse.Errors.Error.ErrorCode}:${resultObject.TrackResponse.Errors.Error.ErrorMessage}`,
          );
        } else {
          const rawTrackingArray = resultObject.TrackResponse.Result.Packages.Package.Events.Event;
          const tracking = this._toTracking(trackingNumber, rawTrackingArray);
          chunkTrackingArray.push(...tracking);
        }
      });
      await Promise.all(fetchTrackingPromises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }

  async fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents) {
    const trackingArray = [];
    try {
      for (const trackingNumberArrayChunk of _.chunk(trackingNumberPostCodeArray, 5)) {
        const promises = trackingNumberArrayChunk.map(async m => {
          const chunkTrackingArray = await this.singleTrackingRequest(m.trackingNumber, m.postCode);
          trackingArray.push(...chunkTrackingArray);
        });
        await Promise.all(promises);
        await delay(1000);
      }
    } catch (e) {
      Logger.error('BE tracking: ' + e.message);
    }

    const result = await super.descMapHandle(Transporter.BE, trackingArray, cmsEvents, false);
    return {
      ...result,
      failedTrackingNumberArray: [],
    };
  }

  private async singleTrackingRequest(trackingNumber: string, postCode: string) {
    try {
      const response = await axios.request({
        url: `https://track.bpost.cloud/track/items?itemIdentifier=${trackingNumber}&postalCode=${postCode}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Host: 'track.bpost.cloud',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
          'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });

      return response.data.items[0].events.map(rawTracking => {
        return {
          trackingNumber: trackingNumber,
          event: '',
          timestamp: moment.tz(`${rawTracking.date} ${rawTracking.time}`, 'Europe/Paris').toDate(),
          description: rawTracking.key.EN.description,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.error(`BE trackingNumber:${trackingNumber},${e.message}`);
      return [];
    }
  }

  private _buildXmlString(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const options: any = classToPlain(shipment.options) || {};
    if (!shipment.parcels) {
      shipment.parcels = [shipment.parcel];
    }
    const myPackage = [];
    shipment.parcels.forEach(parcel => {
      const temp = {
        WeightUnit: 'KG',
        Weight: parcel.weight,
        DimensionsUnit: 'CM',
        //TODO keminfeng 入参没有这个属性
        // Width: 15,
        // Length: 6,
        // Height: 13,
        PackageReference: parcel.reference,
      };
      myPackage.push(temp);
    });

    const item = [];
    const items: ParcelItemDto[] = _.flatMap(shipment.parcels.map(parcel => parcel.items));
    items.map(eItem => {
      const temp = {
        //TODO keminfeng item 中没有
        Sku: eItem.description,
        HSCode: eItem.hsCode,
        Quantity: eItem.quantity,
        UnitPrice: eItem.value,
        Description: eItem.description,
        CountryOfOrigin: eItem.originCountry,
      };
      item.push(temp);
    });

    const accountInfo = channelConfig.accountInfo;
    const receiverAddress = shipment.receiverAddress;
    const senderAddress = shipment.senderAddress;
    const parcels = shipment.parcels;
    const xmlObject = {
      ShipRequest: {
        Login: {
          Username: accountInfo.username,
          Password: accountInfo.password,
        },
        Test: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'production-cn',
        ClientID: accountInfo.clientId,
        // AccountNumber: accountInfo.accountNumber,
        // 使用那个包裹的Reference?
        Reference: shipment.parcels[0].reference,
        ShipTo: {
          Name: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
          Address1: receiverAddress.street1,
          Address2: receiverAddress.street2,
          Address3: receiverAddress.street3,
          City: receiverAddress.city,
          State: receiverAddress.province,
          PostalCode: receiverAddress.postalCode,
          Country: receiverAddress.countryCode,
          Phone: receiverAddress.phoneNumber || receiverAddress.mobileNumber,
          Email: receiverAddress.email,
          ConsigneeTaxID: receiverAddress.taxInfo,
        },
        ShippingLane: {
          Region: 'Client EMC',
          OriginFacilityCode: '',
        },
        /**
         * TODO 产品码
         * LGINTBPMP: MaxiPak Scan EU destinations
         * 单包裹 寄非欧洲 却成功
         * LGINTBPMU: MaxiPak Scan non-EU destinations
         * 多包裹 寄欧洲 却成功
         *
         * 测试 生产 文档
         */
        ShipMethod: channelConfig.productCode || 'LGINTBPMU',
        OrderTotal: _.sum(_.flatMap(parcels, parcel => parcel.items.map(item => item.value * item.quantity))),
        // OrderInsuranceFreightTotal: '',
        ShipmentInsuranceFreight: options.insuranceValue || 0,
        ItemsCurrency: 'EUR',
        //TODO keminfeng 清关服务 写进TransporterOption里
        IsCommercialShipment: 0,
        labelFormat: channelConfig.labelFormat.value,
        LabelEncoding: 'BASE64',
        // ReturnInformation: {},
        VendorInformation: {
          VendorName: senderAddress.company || `${senderAddress.firstName} ${senderAddress.lastName}`,
          VendorAddress1: senderAddress.street1,
          VendorAddress2: senderAddress.street2,
          VendorCity: senderAddress.city,
          VendorState: senderAddress.province,
          VendorPostalCode: senderAddress.postalCode,
          VendorCountry: senderAddress.countryCode,
          // VendorBusinessNumber: '',
          // VendorRGRNumber: '',
        },
        Packages: {
          Package: myPackage,
        },
        Items: {
          Item: item,
        },
      },
    };
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'production-cn') {
      xmlObject.ShipRequest.ShippingLane = undefined;
    }
    return new Xml2js.Builder().buildObject(xmlObject);
  }

  private _toTracking(trackingNumber, rawTrackingArray) {
    return rawTrackingArray.map(item => {
      return {
        trackingNumber,
        timestamp: moment.tz(item.DateTime, 'YYYY-MM-DD HH:mm:ss', 'America/Chicago').toDate(),
        event: item.EventCode,
        location: item.Location,
        description: item.Status,
      };
    });
  }
}
