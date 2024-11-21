import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import moment from 'moment';
import 'moment-timezone';
import request from 'request-promise';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { GlsOption } from '@/domain/sci/transporter/broker/gls/gls.option';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Moment } from '@softbrains/common-utils';
import _ from 'lodash';
import { TransporterException } from '@/app/exception/transporter-exception';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { Logger } from '@/app/logger';
import { TrackingMappingPolicy } from '@/domain/sci/transporter/broker/gls/tracking-mapping-policy';

// 法国的GLS
@Injectable()
export class GlsBroker extends TransporterBroker {
  pdfUtil = new PdfUtil();

  async create(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const { senderAddress, receiverAddress, parcel, shippingDate } = shipment;
    const { accountInfo, labelFormat } = channelConfig;

    const glsOptions: any = plainToClass(GlsOption, shipment.options) || {};
    const { flexDeliveryService, shopReturnService } = glsOptions;

    let { parcels } = shipment;
    parcels = parcels || [];
    if (parcels.length === 0 && parcel) parcels.push(parcel);
    const bodyParcels = parcels.map(parcel => {
      let { weight } = parcel;
      weight = weight > 0 && weight < 0.1 ? 0.1 : weight;
      return {
        weight,
        references: [parcel.reference],
        comment: receiverAddress.comment,
        // FDS : FlexDeliveryService 短信通知收件人
        services: flexDeliveryService ? [{ name: 'flexDeliveryService' }] : [],
      };
    });
    const data = {
      shipperId: accountInfo.shipperID,
      shipmentDate: formatShippingDate(shippingDate),
      incoterm: 20, // 本身是表示需要清关，现在默认都传20（不论是否需要清关）
      addresses: {
        alternativeShipper: {
          name1: TransporterUtils.getAddressName(senderAddress),
          name2: senderAddress.street2,
          name3: senderAddress.street3,
          street1: senderAddress.street1,
          country: senderAddress.countryCode,
          zipCode: senderAddress.postalCode,
          city: senderAddress.city,
        },
        delivery: {
          name1: TransporterUtils.getAddressName(receiverAddress),
          name2: receiverAddress.street2,
          name3: receiverAddress.street3,
          street1: receiverAddress.street1,
          country: receiverAddress.countryCode,
          zipCode: receiverAddress.postalCode,
          city: receiverAddress.city,
          contact: TransporterUtils.getFullName(receiverAddress),
          email: receiverAddress.email,
          phone: receiverAddress.phoneNumber,
          mobile: receiverAddress.mobileNumber,
        },
      },
      parcels: bodyParcels,
      labelSize: labelFormat.value,
    };
    // TODO xiewenzhen 闫涛说这个服务干什么的已经忘记了
    if (shopReturnService) {
      data.addresses['return'] = {
        name1: shipment.senderAddress.firstName,
        street1: shipment.senderAddress.street1,
        country: 'FR',
        zipCode: shipment.senderAddress.postalCode,
        city: shipment.senderAddress.city,
      };
      data.parcels[0].services.push({ name: 'shopreturnservice' });
      data['returns'] = [{ weight: parcel.weight }];
    }

    if ((<GlsOption>shipment.options).returnService) {
      getReturnData(data, senderAddress);
    }
    const auth = 'Basic ' + Buffer.from(accountInfo.login + ':' + accountInfo.password).toString('base64');
    const requestOptions = {
      uri: channelConfig.shipmentUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: auth,
      },
      json: true,
      body: data,
      timeout: 7000,
    };

    let response: any;
    try {
      response = await request(requestOptions);
    } catch (err) {
      throw new TransporterException('GLS', err.message, requestOptions);
    }
    // GLS多包裹面单只有一个返回值
    const {
      parcels: responseParcels,
      labels: [label],
    } = response;
    const shippingNumber = response.consignmentId;
    const trackingNumber = response.parcels[0].trackId;
    const labelWithLogo = await this.pdfUtil.drawLogoOnLabel(
      label,
      channelConfig.platform,
      channelConfig.transporterId,
      channelConfig.labelFormat.code,
      glsOptions.enableCustomLogo,
    );
    if (responseParcels.length > 1) {
      return responseParcels.map(parcel => ({
        shippingNumber,
        trackingNumber: parcel.trackId,
        label: labelWithLogo,
        labelFormat: labelFormat.labelType,
        transporterRequest: JSON.stringify(requestOptions),
        transporterResponse: JSON.stringify(response),
        barCode: shippingNumber,
      }));
    }
    return {
      shippingNumber,
      trackingNumber,
      label: labelWithLogo,
      labelFormat: labelFormat.labelType,
      transporterRequest: JSON.stringify(requestOptions),
      transporterResponse: JSON.stringify(response),
      barCode: shippingNumber,
    };
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
            // !!!xiewenzhen 这个是GLS的跟踪号, 和我们自己的跟踪号有区别. 举例'ZWKWVEJV'我们的单号, GLS单号'92557407083', 所以parcel.trackid='92557407083', 并非'ZWKWVEJV'
            // 类似的狗屎还有 ZWKY2JDB ZWKY2IN3
            // ZWKY471G ZWKY471H 直接不返回单号了
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

function formatShippingDate(date) {
  return moment.tz(date, 'Europe/Paris').format('YYYY-MM-DD');
}

function requireIncoterm(receiverAddress) {
  return ['CH', 'NO', 'IE', 'GB', 'LI', 'TR'].includes(receiverAddress.countryCode);
}

function getReturnData(data, senderAddress) {
  data.addresses.pickup = {
    name1: TransporterUtils.getAddressName(senderAddress),
    name2: senderAddress.street2,
    name3: senderAddress.street3,
    street1: senderAddress.street1,
    country: senderAddress.countryCode,
    zipCode: senderAddress.postalCode,
    city: senderAddress.city,
  };
  data.parcels[0].services.push({ name: 'shopreturnservice', infos: [{ name: 'returnonly', value: 'Y' }] });
  return data;
}
