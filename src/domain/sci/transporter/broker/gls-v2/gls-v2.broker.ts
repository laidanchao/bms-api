import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import 'moment-timezone';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import { TransporterException } from '@/app/exception/transporter-exception';
import request from 'request-promise';
import { GlsOptionV2 } from './gls-v2.option';
import { plainToClass } from 'class-transformer';
import _ from 'lodash';
import { TrackingMappingPolicy } from '@/domain/sci/transporter/broker/gls/tracking-mapping-policy';
import { Logger } from '@/app/logger';
import { Moment } from '@softbrains/common-utils';

@Injectable()
export class GlsV2Broker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const { senderAddress, receiverAddress, parcel, shippingDate } = shipment;
    const { accountInfo, labelFormat, shipmentUrl } = channelConfig;

    const glsOptions: any = plainToClass(GlsOptionV2, shipment.options) || {};
    const { flexDeliveryService, shopReturnService } = glsOptions;

    let { parcels } = shipment;
    parcels = parcels || [];
    if (!parcels.length && parcel) parcels.push(parcel);
    const bodyParcels = parcels.map(parcel => {
      let { weight } = parcel;
      weight = weight > 0 && weight < 0.1 ? 0.1 : weight;
      return {
        weight,
        references: parcel.reference ? [parcel.reference] : null,
      };
    });

    const receiveCompanyName = receiverAddress.company;
    const sendCompanyName = senderAddress.company;
    const receiverName = TransporterUtils.getFullName({
      firstName: receiverAddress.firstName,
      lastName: receiverAddress.lastName,
    });
    const senderName = TransporterUtils.getFullName({
      firstName: senderAddress.firstName,
      lastName: senderAddress.lastName,
    });

    const data = {
      Shipment: {
        Product: 'PARCEL',
        IncotermCode: 20,
        Consignee: {
          Address: {
            Name1: receiveCompanyName || receiverName,
            CountryCode: receiverAddress.countryCode,
            Province: receiverAddress.province || '',
            ZIPCode: receiverAddress.postalCode,
            City: receiverAddress.city,
            Street: receiverAddress.street1,
            eMail: receiverAddress.email,
            ContactPerson: receiveCompanyName ? receiverName : '', // 有公司名时，填写寄件人名，否则为空
            FixedLinePhonenumber: receiverAddress.phoneNumber, // 固定电话
            MobilePhoneNumber: receiverAddress.mobileNumber, // 手机号
          },
        },
        Shipper: {
          ContactID: accountInfo.accountNumber,
          AlternativeShipperAddress: {
            Name1: sendCompanyName || senderName,
            CountryCode: senderAddress.countryCode,
            Province: senderAddress.province || '',
            ZIPCode: senderAddress.postalCode,
            City: senderAddress.city,
            Street: senderAddress.street1,
            eMail: senderAddress.email,
            ContactPerson: sendCompanyName ? senderName : '', // 有公司名时，填写收件人名，否则为空
            FixedLinePhonenumber: senderAddress.phoneNumber, // 固定电话
            MobilePhoneNumber: senderAddress.mobileNumber, // 手机号
          },
        },
        ShipmentUnit: bodyParcels.map(item => ({
          ShipmentUnitReference: item.references,
          Weight: item.weight,
        })),
      },
      PrintingOptions: {
        ReturnLabels: {
          TemplateSet: labelFormat.labelSize,
          LabelFormat: labelFormat.value,
        },
      },
    };

    if (flexDeliveryService) {
      data.Shipment['Service'] = [
        {
          Service: {
            ServiceName: 'service_flexdelivery',
          },
        },
      ];
    }

    const auth = 'Basic ' + Buffer.from(accountInfo.username + ':' + accountInfo.password).toString('base64');
    let url = shipmentUrl;
    // 此处硬编码，当使用新帐号时，需要用新的下单url
    if (accountInfo.username === '25039578ST' && process.env.NODE_ENV.includes('production')) {
      url = 'https://wbm-fr02.shipit.gls-group.com:443/backend/rs/shipments';
    }
    const requestOptions = {
      uri: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/glsVersion1+json',
        Accept: 'application/glsVersion1+json,application/json',
        Authorization: auth,
      },
      json: true,
      body: data,
      timeout: 10000,
    };

    let response: any;
    try {
      response = await request(requestOptions);

      const { ParcelData, PrintData } = response.CreatedShipment;
      const result = _.map(ParcelData, (item, index) => {
        return {
          shippingNumber: item.ParcelNumber,
          trackingNumber: item.TrackID,
          label: PrintData[index].Data,
          labelFormat: PrintData[index].LabelFormat,
          barCode: item.Barcodes.Primary2D,
        };
      });

      result[0].transporterRequest = JSON.stringify(requestOptions);
      result[0].transporterResponse = JSON.stringify(response);

      if (!shipment.parcels && parcel) {
        return result[0];
      } else {
        return result;
      }
    } catch (err) {
      throw new TransporterException('GLSV2', err.response?.headers?.message || err.message, requestOptions);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray }) {
    const trackingArray = [];
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 150)) {
      const chunkTrackingArray = [];
      for (const trackingNumbers of _.chunk(chunkTrackingNumberArray, 15)) {
        try {
          const { parcels } = await request({
            uri: `https://api.gls-group.eu/public/v1/tracking/references/${trackingNumbers.join(',')}`, //支持多包裹查询,后面可以重构
            json: true,
            headers: {
              Authorization: 'Basic MjUwNDk4Njd3czo0OTg2Nw==',
            },
          });
          const rawTracking = [];
          for (const parcel of parcels) {
            let trackingNumber = parcel.trackid;
            if (!trackingNumbers.includes(trackingNumber)) {
              const references = JSON.stringify(parcel.references);
              trackingNumber =
                trackingNumbers.find(trackingNumber => references.includes(trackingNumber)) || trackingNumber;
            }

            rawTracking.push(
              ...parcel.events.map(event => {
                return {
                  timestamp: Moment.tz(event.timestamp, 'Europe/Paris').format(),
                  trackingNumber: trackingNumber,
                  event: TrackingMappingPolicy.fromGLSEvent(event.description),
                  description: event.description,
                  location: `${event.country} ${event.location}`.trim(),
                  reference: event.code,
                };
              }),
            );
          }
          chunkTrackingArray.push(...rawTracking);
        } catch (e) {
          Logger.warn(e.message);
        }
      }
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }
}
