import { Injectable } from '@nestjs/common';
import { Logger } from '@/app/logger';
import moment from 'moment';
import 'moment-timezone';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { formatUPS } from '@ftlab/pdf-utils';
import { GeneratorInvoicePdf } from '@/domain/sci/transporter/broker/common/generate-invoice-pdf';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import _ from 'lodash';
import { TransporterException } from '@/app/exception/transporter-exception';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { AddressDto, ParcelDto } from '@/domain/ord/parcel/dto';
import { CreatePickupResponse } from '@/domain/ord/parcel/dto/response/create-pickup-response';
import axios from 'axios';
import qs from 'qs';
import { v4 as uuidV4 } from 'uuid';
import { UpsOption } from '@/domain/sci/transporter/broker/ups/ups.option';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';

/**
 * ups 法国 意大利 西班牙都可以下单成功
 */
@Injectable()
export class UpsBroker extends TransporterBroker {
  pdfUtil = new PdfUtil();

  private BaseUrl = process.env.NODE_ENV.includes('production')
    ? 'https://onlinetools.ups.com'
    : 'https://wwwcie.ups.com';
  private CacheList: { token: string; expiresAt: Date; clientId: string }[] = [];
  private AccountInfo: Record<string, string>;

  async create(shipment: CreateClientDto, channelConfig: BaseConfig) {
    this.AccountInfo = channelConfig.accountInfo;
    // !!!通过shipment.parcel是否存在判断但包裹和多包裹, 异或关系 1/0, 0/1
    if (shipment.parcel) {
      shipment.parcels = [shipment.parcel];
    }
    const results = await this._createMultiple(shipment, channelConfig);

    // TODO xiewenzhen ups的面单格式为 png格式, 因此,需要将png转化为pdf, 速运需要.zpl格式的文件 v1没做改动, v2已改好.
    // transform image
    for (const result of results) {
      if (result.labelFormat === 'zpl') {
        const zplString = Buffer.from(result.label, 'base64')
          .toString('ascii')
          .replace('^POI', '');
        result.label = Buffer.from(zplString, 'ascii').toString('base64');
      } else {
        result.label = await formatUPS(result.label, {
          out: 'base64',
          labelFormat: channelConfig.labelFormat.labelType,
          labelSize: channelConfig.labelFormat.labelSize || '16x30',
        });
        result.label = await this.pdfUtil.drawLogoOnLabel(
          result.label,
          channelConfig.platform,
          channelConfig.transporterId,
          channelConfig.labelFormat.code,
          shipment.options && shipment.options.enableCustomLogo,
        );
      }
    }

    if (!shipment.options['customsCategory']) {
      //UPS 单包裹CN23清关单
      if (shipment.parcel && shipment.parcel.items && shipment.parcel.items.length > 0) {
        shipment['trackingNumber'] = results[0].trackingNumber;
        results[0].cn23 = '';
        results[0].invoice = await GeneratorInvoicePdf.generator(shipment);
      } else if (results.length > 1) {
        // 多包裹 CN23清关单
        for (const item of results) {
          const index = results.indexOf(item);
          const parcel = shipment.parcels[index];
          if (parcel && parcel.items && parcel.items.length > 0 && item.trackingNumber) {
            const shipmentTemp = {
              ...shipment,
              parcel: parcel,
              trackingNumber: item.trackingNumber,
            };
            item.cn23 = '';
            item.invoice = await GeneratorInvoicePdf.generator(shipmentTemp);
          }
        }
      }
    }

    if (!process.env.NODE_ENV.includes('production')) {
      results.forEach(f => {
        const randomStr = _.padStart(_.random(1, 999), 3, 0);
        f.trackingNumber = `${f.trackingNumber}_${moment().format('YYYYMMDD_HHmmss')}_${randomStr}`;
      });
    }

    return results;
  }

  async _createMultiple(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const { senderAddress, receiverAddress, parcels } = shipment;
    const serviceCode = channelConfig.productCode;
    const { number } = this.AccountInfo;
    const options = <UpsOption>shipment.options;
    const customsCategory = options?.customsCategory;

    const requestData = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate',
        },
        Shipment: {
          Description: 'gift',
          Shipper: {
            Name: TransporterUtils.getAddressName(senderAddress),
            AttentionName: TransporterUtils.getFullName(senderAddress),
            Phone: {
              Number: senderAddress.mobileNumber || senderAddress.phoneNumber,
            },
            ShipperNumber: number,
            Address: {
              AddressLine: senderAddress.street1,
              City: senderAddress.city,
              PostalCode: senderAddress.postalCode,
              CountryCode: senderAddress.countryCode,
            },
          },
          ShipTo: {
            Name: TransporterUtils.getAddressName(receiverAddress),
            AttentionName: TransporterUtils.getFullName(receiverAddress),
            Phone: {
              Number: receiverAddress.phoneNumber || receiverAddress.mobileNumber,
            },
            Address: {
              AddressLine: formatStreetArray(receiverAddress),
              City: receiverAddress.city,
              PostalCode: receiverAddress.postalCode,
              CountryCode: receiverAddress.countryCode,
              StateProvinceCode: receiverAddress.province,
            },
          },
          Service: {
            Code: serviceCode || '11',
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: '01',
              BillShipper: {
                AccountNumber: number,
              },
            },
          },
          Package: formatPackageArray(parcels),
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: channelConfig.labelFormat.value,
          },
          LabelStockSize: {},
        },
      },
    };

    if (customsCategory) {
      const products = _.flatMap(parcels, 'items');

      requestData.ShipmentRequest.Shipment['ShipmentServiceOptions'] = {
        InternationalForms: {
          FormType: options.customsCategory,
          InvoiceNumber: options.invoiceNumber,
          InvoiceDate: moment(options.invoiceDate).format('YYYYMMDD'),
          TermsOfShipment: options.incoterm,
          CurrencyCode: options.currencyCode,
          ReasonForExport: parcels[0].options.sendingReason,
          Product: products.map(product => {
            return {
              Description: product.description,
              Unit: {
                Number: product.quantity.toString(),
                UnitOfMeasurement: {
                  Code: product.unitOfMeasurement,
                },
                Value: MathCalculator.mul(product.quantity, product.value).toString(),
              },
              OriginCountryCode: product.originCountry,
            };
          }),
          Contacts: {
            SoldTo: {
              Name: TransporterUtils.getAddressName(receiverAddress),
              AttentionName: TransporterUtils.getFullName(receiverAddress),
              Address: {
                AddressLine: formatStreetArray(receiverAddress),
                City: receiverAddress.city,
                PostalCode: receiverAddress.postalCode,
                CountryCode: receiverAddress.countryCode,
              },
            },
          },
        },
      };
    }

    if (channelConfig.labelFormat.labelType === 'zpl') {
      const labelSize = channelConfig.labelFormat.labelSize.split('x');
      requestData.ShipmentRequest.LabelSpecification.LabelStockSize = {
        Width: labelSize[0],
        Height: labelSize[1],
      };
    }
    // 当寄件国不是法国时（也就是他国寄到法国时），应使用退件服务(应使用ReturnService)
    if (shipment.senderAddress.countryCode !== 'FR') {
      const { shipFrom, shipper } = this.handleReturnService(number, senderAddress, receiverAddress);

      // 1.添加ShipFrom（寄件人信息）
      requestData.ShipmentRequest.Shipment['ShipFrom'] = shipFrom;

      // 2.更换Shipper为收件人
      requestData.ShipmentRequest.Shipment['Shipper'] = shipper;

      // 3.设置ReturnService的code为9
      requestData.ShipmentRequest.Shipment['ReturnService'] = { Code: '9' };
    }

    try {
      const responseData = await this.post(channelConfig.shipmentUrl, requestData);

      const { ShipmentResults } = responseData.ShipmentResponse;
      const result = ShipmentResults.PackageResults.map(item => ({
        shippingNumber: ShipmentResults.ShipmentIdentificationNumber,
        trackingNumber: item.TrackingNumber,
        label: item.ShippingLabel.GraphicImage,
        labelFormat: channelConfig.labelFormat.labelType,
        invoice: ShipmentResults.Form?.Image?.GraphicImage || '',
      }));
      result[0].transporterRequest = requestData;
      result[0].transporterResponse = responseData;
      return result;
    } catch (err) {
      Logger.error(err);
      throw new TransporterException('UPS', JSON.stringify(err.response?.data || err.message), requestData);
    }
  }

  /**
   * Get traces by tracking number
   * @param {Object} options
   * @param {String} options.trackingNumber
   * @returns {Promise.<Array>}
   */

  async fetchTrackingOfficial({ trackingNumberArray, language, accountInfo, webServiceUrl }) {
    this.AccountInfo = accountInfo;
    const trackingArray = [];
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 100)) {
      const chunkTrackingArray = [];
      const promises = chunkTrackingNumberArray.map(async trackingNumber => {
        try {
          switch (language) {
            case 'en':
              language = 'en_US';
              break;
            case 'cn':
              language = 'zh_CN';
              break;
            default:
              language = 'fr_FR';
          }

          const { trackResponse: response } = await this.get(`${this.BaseUrl}/api/track/v1/details/${trackingNumber}`, {
            locale: language,
          });

          const activities = response.shipment[0].package[0].activity;
          const tracking = activities.map(toTracking).map(item => {
            item['trackingNumber'] = trackingNumber;
            return item;
          });
          chunkTrackingArray.push(...tracking);
        } catch (error) {
          Logger.error(error.message);
        }
      });
      await Promise.all(promises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }

  // TODO xiewenzhen ESENDEO和FTL-EXPRESS在用, ups到客户地点取货,
  async schedulePickup(shipment: CreatePickupDto, channelConfig: BaseConfig): Promise<CreatePickupResponse> {
    this.AccountInfo = channelConfig.accountInfo;
    const { senderAddress, pickupAt, quantity, receiverAddress } = shipment;
    const requestData = {
      PickupCreationRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: 'CustomerContext.',
          },
        },
        RatePickupIndicator: 'N',
        TaxInformationIndicator: 'N',
        PickupDateInfo: {
          CloseTime: '1700',
          ReadyTime: '0900',
          PickupDate: formatPickupDate(pickupAt),
        },
        PickupAddress: {
          CompanyName: senderAddress.company || senderAddress.lastName,
          ContactName: senderAddress.lastName || senderAddress.company,
          AddressLine: senderAddress.street1,
          City: senderAddress.city,
          StateProvince: senderAddress.province || '',
          PostalCode: senderAddress.postalCode,
          CountryCode: senderAddress.countryCode,
          ResidentialIndicator: 'N', //住宅地址还是商业地址,N===>商业地址
          Phone: {
            Number: senderAddress.phoneNumber || senderAddress.mobileNumber,
          },
        },
        AlternateAddressIndicator: 'N',
        PickupPiece: {
          ServiceCode: channelConfig.productCode,
          Quantity: `${quantity}`,
          DestinationCountryCode: receiverAddress?.countryCode || senderAddress.countryCode,
          ContainerCode: '01',
        },
        OverweightIndicator: 'N', //包裹是否超过70KG
        PaymentMethod: '00',
      },
    };

    try {
      const { PickupCreationResponse: response } = await this.post(
        `${this.BaseUrl}/api/pickupcreation/v2403/pickup`,
        requestData,
      );

      if (!process.env.NODE_ENV.includes('production')) {
        response.PRN = `${response.PRN}_${moment().format('YYYYMMDD_HHmmss')}`;
      }

      return {
        PRN: response.PRN,
        transporterRequest: JSON.stringify(requestData),
        transporterResponse: JSON.stringify(response),
        returnResult: response,
      };
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new TransporterException('UPS', JSON.stringify(err.response?.data || err.message), requestData);
    }
  }

  /**
   *
   * @param dto
   * @param config
   * @return {Promise<string>}
   */

  async cancelShipment(dto, config) {
    this.AccountInfo = config.accountInfo;
    try {
      const { VoidShipmentResponse: response } = await this.delete(
        `${this.BaseUrl}/api/shipments/v2403/void/cancel/${dto.shippingNumber}`,
        {
          trackingnumber: dto.trackingNumbers,
        },
      );

      return response.Response.ResponseStatus.Description;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new TransporterException('UPS', JSON.stringify(err.response?.data || err.message));
    }
  }

  async cancelPickup(dto, config) {
    this.AccountInfo = config.accountInfo;
    if (!process.env.NODE_ENV.includes('production')) {
      dto.pickupRequestNumber = dto.pickupRequestNumber.split('_')[0];
    }
    try {
      const { PickupCancelResponse: response } = await this.delete(
        `${this.BaseUrl}/api/shipments/v2403/pickup/02`,
        null,
        {
          Prn: dto.pickupRequestNumber,
        },
      );

      return response.Response.ResponseStatus.Description;
    } catch (err) {
      Logger.error(JSON.stringify(err));
      throw new TransporterException('UPS', JSON.stringify(err.response?.data || err.message));
    }
  }

  private async getToken() {
    const { ClientId, ClientSecret } = this.AccountInfo;
    const cache = this.CacheList.find(f => f.clientId === ClientId);
    if (cache && cache.token && moment().isBefore(cache.expiresAt)) {
      return cache.token;
    }
    const credentials = Buffer.from(`${ClientId}:${ClientSecret}`).toString('base64');
    const { data } = await axios.post(
      `${this.BaseUrl}/security/v1/oauth/token`,
      qs.stringify({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        timeout: 10000,
      },
    );

    // expires_in多少秒后过期
    const { access_token, expires_in } = data;

    const expiresAt = moment()
      .add(Number(expires_in) - 300, 'seconds')
      .toDate();
    if (cache) {
      cache.token = access_token;
      cache.expiresAt = expiresAt;
    } else {
      this.CacheList.push({
        clientId: ClientId,
        token: access_token,
        expiresAt,
      });
    }
    return access_token;
  }

  private async post(url: string, data: any) {
    const accessToken = await this.getToken();
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  private async get(url: string, params: any) {
    const accessToken = await this.getToken();
    const response = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        transId: uuidV4(),
        transactionSrc: 'FTL',
      },
    });
    return response.data;
  }

  private async delete(url: string, params: any, header?: any) {
    const accessToken = await this.getToken();
    const response = await axios.delete(url, {
      params,
      headers: {
        ...header,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  private handleReturnService(number: string, senderAddress: AddressDto, receiverAddress: AddressDto) {
    const shipFrom = {
      Name: TransporterUtils.getAddressName(senderAddress),
      AttentionName: TransporterUtils.getFullName(senderAddress),
      Phone: {
        Number: senderAddress.mobileNumber || senderAddress.phoneNumber,
      },
      ShipperNumber: number,
      Address: {
        AddressLine: senderAddress.street1,
        City: senderAddress.city,
        PostalCode: senderAddress.postalCode,
        CountryCode: senderAddress.countryCode,
        StateProvinceCode: senderAddress.province,
      },
    };

    const shipper = {
      Name: TransporterUtils.getAddressName(receiverAddress),
      AttentionName: TransporterUtils.getFullName(receiverAddress),
      Phone: {
        Number: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
      },
      ShipperNumber: number,
      Address: {
        AddressLine: receiverAddress.street1,
        City: receiverAddress.city,
        PostalCode: receiverAddress.postalCode,
        CountryCode: receiverAddress.countryCode,
      },
    };

    return {
      shipFrom,
      shipper,
    };
  }
}

function toTracking(activity) {
  const { location, status, date, time } = activity;
  return {
    timestamp: moment.tz(`${date} ${time}`, 'YYYYMMDD HHmmss', 'Europe/Paris').toDate(),
    event: `UPS_${status.code || status.type + status.statusCode}`,
    description: status.description,
    location: `${location?.address?.city || ''} ${location?.address?.countryCode || ''}`,
  };
}

function formatPickupDate(date) {
  return moment.tz(date, 'Europe/Paris').format('YYYYMMDD');
}

function formatStreetArray(address) {
  return [address.street3, address.street2, address.street1].filter(street => street);
}

function formatPackageArray(parcels: ParcelDto[]) {
  return parcels.map(item => {
    const Package = {
      Description: 'Description',
      Packaging: {
        Code: '02',
        Description: 'PKG',
      },
      Dimensions: {
        UnitOfMeasurement: {
          Code: 'CM',
          Description: 'CM',
        },
        Length: '15',
        Width: '15',
        Height: '15',
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: 'KGS',
          Description: 'KG',
        },
        Weight: `${item.weight}`,
      },
      PackageServiceOptions: {
        DeclaredValue: {
          MonetaryValue: `${item.value || item.insuranceValue || 0}`,
          CurrencyCode: 'EUR',
        },
      },
    };
    if (item.reference) Package['ReferenceNumber'] = { Value: item.reference };
    return Package;
  });
}
