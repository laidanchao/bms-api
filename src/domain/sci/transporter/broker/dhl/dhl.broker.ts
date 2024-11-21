import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import moment from 'moment';
import _ from 'lodash';
import {
  CustomsClearanceType,
  CustomsInvoiceType,
  DhlOption,
  DhlProductCode,
  RegistrationNumber,
  RequireDHLCustomsInvoice,
  ShippingPaymentType,
  SpecialServiceType,
} from '@/domain/sci/transporter/broker/dhl/dhl.constrant';
import { Injectable } from '@nestjs/common';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BusinessException } from '@/app/exception/business-exception';
import { TransporterException } from '@/app/exception/transporter-exception';
import { v4 as uuidV4 } from 'uuid';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { Logo } from '@/domain/sci/transporter/broker/common/logo';

@Injectable()
export class DhlBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse[]> {
    const accountInfo = channelConfig.accountInfo;
    if (shipment.parcel && (!shipment.parcels || !shipment.parcels.length)) {
      shipment.parcels = [shipment.parcel];
    }
    const data = this._buildData(shipment, channelConfig);

    const soapConfig = this._buildSoapConfig(
      `${process.cwd()}/src/assets/wsdl/dhl/Shipment.wsdl`,
      channelConfig.shipmentUrl,
    );
    let client: any, responses;
    try {
      client = await new Soap().createClient(soapConfig, accountInfo);
      responses = await client['createShipmentRequestAsync'](data);
    } catch (e) {
      throw new TransporterException('DHL', e.body, client.lastRequest);
    }
    const response = responses[0];
    if ('0' === response.Notification[0].attributes.code) {
      const label = response.LabelImage[0].GraphicImage;
      const invoice = response.Documents && response.Documents.Document[0].DocumentImage;
      const labelFormat = response.LabelImage[0].LabelImageFormat;
      const shipmentNumber = response.ShipmentIdentificationNumber;
      return response.PackagesResult.PackageResult.map(result => {
        return {
          trackingNumber: shipmentNumber,
          shippingNumber: shipmentNumber,
          label,
          labelFormat,
          transporterRequest: client.lastRequest,
          transporterResponse: client.lastResponse,
          invoice,
          cn23: '',
          barCode: `J${result.TrackingNumber}`,
        };
      });
    } else {
      throw new TransporterException('DHL', response.Notification[0].Message, client.lastRequest);
    }
  }

  async getShipmentRate(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const accountInfo = channelConfig.accountInfo;

    const dhlOptions: any = shipment.options || {};
    // 当枚举类的Name与Value不一致时, 要做如下判断
    const customsClearanceType = dhlOptions.whetherCustomsClearance
      ? CustomsClearanceType.NON_DOCUMENTS
      : CustomsClearanceType.DOCUMENTS;

    if (shipment.parcel && (!shipment.parcels || !shipment.parcels.length)) {
      shipment.parcels = [shipment.parcel];
    }

    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const RequestedPackages = _.map(shipment.parcels, (parcel, index) => {
      return {
        attributes: {
          // 第几个包裹
          number: index + 1,
        },
        Weight: {
          Value: parcel.weight > 0.1 ? parcel.weight : 0.1,
        },
        Dimensions: {
          Length: parcel.length || 1.0,
          Width: parcel.width || 1.0,
          Height: parcel.height || 1.0,
        },
      };
    });

    const soapConfig = this._buildSoapConfig(
      `${process.cwd()}/src/assets/wsdl/dhl/Shipment.wsdl`,
      // TODO xiewenzhen 获取定价的接口, 直接使用生产的请求地址
      'https://wsbexpress.dhl.com/gbl/expressRateBook',
    );
    const client: any = await new Soap().createClient(soapConfig, accountInfo);
    const data = {
      RequestedShipment: {
        DropOffType: 'REQUEST_COURIER',
        ShipTimestamp: this.formatShippingDate(shipment.shippingDate),
        UnitOfMeasurement: 'SI',
        Content: customsClearanceType,
        PaymentInfo: dhlOptions.paymentInfo || 'DAP',
        Account: accountInfo.shipperAccountNumber,
        Ship: {
          Shipper: {
            StreetLines: senderAddress.street1,
            StreetLines2: senderAddress.street2,
            StreetLines3: senderAddress.street3,
            City: senderAddress.city,
            PostalCode: senderAddress.postalCode || ' ',
            CountryCode: senderAddress.countryCode,
          },
          Recipient: {
            StreetLines: receiverAddress.street1,
            StreetLines2: receiverAddress.street2,
            StreetLines3: receiverAddress.street3,
            City: receiverAddress.city,
            PostalCode: receiverAddress.postalCode || ' ',
            CountryCode: receiverAddress.countryCode,
          },
        },
        Packages: {
          RequestedPackages: RequestedPackages,
        },
      },
    };
    let responses;
    try {
      responses = await client['getRateRequestAsync'](data);
      if (responses[0].Provider.Notification[0].attributes.code === '0') {
        return responses[0].Provider.Service;
      } else {
        throw new Error(responses[0].Provider.Notification[0].Message);
      }
    } catch (e) {
      throw (new TransporterException('DHL', e.message), client.lastRequest);
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo, language = 'eng' }) {
    // 经测试 usaFR 和 esendeoFR 账号均可获取轨迹
    if (!accountInfo || !accountInfo.username || !accountInfo.password) {
      // 提供默认账号
      accountInfo = {
        username: 'usaFR',
        password: 'R!7bW@5kV#2p',
      };
    }
    const soapConfig = this._buildSoapConfig(
      `${process.cwd()}/src/assets/wsdl/dhl/Tracking.wsdl`,
      'https://wsbexpress.dhl.com/gbl/glDHLExpressTrack',
    );
    const client: any = await new Soap().createClient(soapConfig, accountInfo);

    // 区分出 shippingNumber 和 trackingNumber
    const trackingNumberPartition = _.partition(trackingNumberArray, trackingNumber => trackingNumber.length <= 11);
    const shippingNumberArray = trackingNumberPartition[0];
    trackingNumberArray = trackingNumberPartition[1];

    const requestBodyArray = [];
    _.chunk(trackingNumberArray, 100).forEach(chunkTrackingNumberArray =>
      requestBodyArray.push(this.buildFetchTrackingData(chunkTrackingNumberArray, 'TRACKING_NUMBER', language)),
    );
    _.chunk(shippingNumberArray, 100).forEach(chunkShippingNumberArray =>
      requestBodyArray.push(this.buildFetchTrackingData(chunkShippingNumberArray, 'SHIPPING_NUMBER', language)),
    );

    const trackingArray = [];
    const promises = requestBodyArray
      .filter(requestBody => !!requestBody)
      .map(async requestBody => {
        const responses = await client['trackShipmentRequestAsync'](requestBody);

        let arrayOfAWBInfoItem = responses[0].trackingResponse.TrackingResponse.AWBInfo.ArrayOfAWBInfoItem;
        if (!_.isArray(arrayOfAWBInfoItem)) {
          arrayOfAWBInfoItem = [arrayOfAWBInfoItem];
        }
        const chunkTrackingArray = _.chain(arrayOfAWBInfoItem)
          .filter(item => 'Success' === item.Status.ActionStatus)
          .filter(item => item.Pieces?.PieceInfo?.ArrayOfPieceInfoItem?.PieceEvent)
          .flatMap(item => {
            const rawTrackingArray = item.Pieces.PieceInfo.ArrayOfPieceInfoItem.PieceEvent.ArrayOfPieceEventItem;
            return rawTrackingArray.map(rawTracking => {
              return {
                trackingNumber: item.AWBNumber,
                event: rawTracking.ServiceEvent.EventCode,
                // 传过来的时间就是+0时区的时间
                timestamp: moment.utc(`${rawTracking.Date} ${rawTracking.Time}`).toDate(),
                description: rawTracking.ServiceEvent.Description,
                location: rawTracking.ServiceArea.Description,
              };
            });
          })
          .value();
        trackingArray.push(...chunkTrackingArray);
      });
    await Promise.all(promises);
    return trackingArray;
  }

  /**
   * 根据传入的单号类型组装不同的数据
   * @param numberArray 单号数组
   * @param type 类型
   * @param language 语言
   * @private
   */
  private buildFetchTrackingData(numberArray, type, language) {
    if (!numberArray || !numberArray.length) {
      return null;
    }
    const data = {
      trackingRequest: {
        TrackingRequest: {
          LanguageCode: language,
          LevelOfDetails: 'ALL_CHECKPOINTS', // 完成的轨迹集合
          Request: {
            ServiceHeader: {
              MessageTime: moment()
                .utc()
                .format('YYYY-MM-DDTHH:mm:ssZ'),
              MessageReference: uuidV4().replace(/-/g, ''),
            },
          },
          /*
          B = Both Piece and Shipment
          S = Shipment Details Only
          P = Piece Details Only.
          返回信息详情
          */
          PiecesEnabled: 'P',
          EstimatedDeliveryDateEnabled: 0,
        },
      },
    };
    switch (type) {
      case 'TRACKING_NUMBER': {
        data.trackingRequest.TrackingRequest['LPNumber'] = {
          ArrayOfTrackingPieceIDItem: numberArray,
        };
        break;
      }
      case 'SHIPPING_NUMBER': {
        data.trackingRequest.TrackingRequest['AWBNumber'] = {
          ArrayOfAWBNumberItem: numberArray,
        };
        break;
      }
    }
    return data;
  }

  private _buildSoapConfig(wsdl, url) {
    return {
      wsdl,
      // wsdl 中抄来的
      url,
      header: {
        'wsse:Security': {
          attributes: {
            'xmlns:wsse': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
          },
          'wsse:UsernameToken': {
            'wsse:Username': '{{username}}',
            'wsse:Password': {
              attributes: {
                Type: 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText',
              },
              $value: '{{password}}',
            },
          },
        },
      },
      timeout: 10000,
    };
  }

  private _buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const labelFormat = channelConfig.labelFormat;
    const accountInfo = channelConfig.accountInfo;
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;

    const parcels = shipment.parcels;

    const shippingDate = shipment.shippingDate;
    const productCode: DhlProductCode = <DhlProductCode>channelConfig.productCode;
    const dhlOptions: any = shipment.options || {};
    // 当枚举类的Name与Value不一致时, 要做如下判断
    const customsClearanceType = dhlOptions.whetherCustomsClearance
      ? CustomsClearanceType.NON_DOCUMENTS
      : CustomsClearanceType.DOCUMENTS;

    this.validateSpecialServiceIsAvailable(dhlOptions.specialServices);
    const services = [];
    const found = _.find(dhlOptions.specialServices, specialService => specialService === 'INSURANCE_SERVICE');
    if (found) {
      const insuranceAmount = _.round(
        MathCalculator.sumBy(parcels, parcel => parcel.insuranceValue),
        2,
      );
      services.push({
        ServiceType: SpecialServiceType.INSURANCE_SERVICE,
        ServiceValue: insuranceAmount,
        CurrencyCode: 'EUR',
      });
    }

    const SpecialServices = {
      Service: services,
    };

    let shippingPaymentType;
    switch (dhlOptions.shippingPaymentType) {
      case 'T':
        shippingPaymentType = ShippingPaymentType.T;
        break;
      case 'R':
        shippingPaymentType = ShippingPaymentType.R;
        break;
      default:
        shippingPaymentType = ShippingPaymentType.S;
    }

    // !!!目前最好使用单包裹
    const requestedPackages = parcels.map((parcel, index) => {
      return {
        attributes: {
          // 包裹数量
          number: index + 1,
        },
        Weight: parcel.weight,
        // InsuredValue: parcel.insuranceValue, // DHL reply this is not available
        Dimensions: {
          // unit: cm
          Length: parcel.length || 1.0,
          Width: parcel.width || 1.0,
          Height: parcel.height || 1.0,
        },
        CustomerReferences: parcel.reference, // DHL 文档说是shipment的reference. 包裹有包裹的reference, 目前单包裹没什么影响, 多包裹就有问题了.
      };
    });
    const customsValue = _.round(
      MathCalculator.sumBy(
        _.flatMapDeep(parcels, parcel => parcel.items),
        item => MathCalculator.mul(item.value, item.quantity),
      ),
      2,
    );
    const shipperRegistrationNumbers: RegistrationNumber[] = <RegistrationNumber[]>(
      dhlOptions.shipperRegistrationNumbers
    );
    const recipientRegistrationNumbers: RegistrationNumber[] = <RegistrationNumber[]>(
      dhlOptions.recipientRegistrationNumbers
    );
    const data: any = {
      ClientDetail: '',
      RequestedShipment: {
        ShipmentInfo: {
          DropOffType: 'REGULAR_PICKUP', // 推荐
          // product code
          ServiceType: productCode,
          Billing: {
            ShipperAccountNumber: accountInfo.shipperAccountNumber,
            ShippingPaymentType: shippingPaymentType,
            BillingAccountNumber: accountInfo.shipperAccountNumber,
          },
          Currency: 'EUR',
          UnitOfMeasurement: 'SI', // SI, SU 默认为SI, KG和CM
          LabelType: labelFormat.type,
          // labelFormat
          // (CustomerBarcode is only applicable when LabelTemplate=‘ECOM26_84CI_002’)
          LabelTemplate: labelFormat.value,
        },
        // equal with pickUpAt
        ShipTimestamp: this.formatShippingDate(shippingDate),
        // DDP
        PaymentInfo: dhlOptions.paymentInfo || 'DAP',
        InternationalDetail: {
          Commodities: {
            // 这个是shipment的描述
            Description: shipment.description,
            CustomsValue: customsValue,
          },
          Content: customsClearanceType,
        },
        Ship: {
          Shipper: {
            Contact: {
              PersonName: `${senderAddress.firstName || ''} ${senderAddress.lastName || ''}`,
              CompanyName: senderAddress.company,
              PhoneNumber: senderAddress.phoneNumber,
              EmailAddress: senderAddress.email,
              MobilePhoneNumber: senderAddress.mobileNumber,
            },
            Address: {
              StreetLines: senderAddress.street1,
              StreetLines2: senderAddress.street2,
              StreetLines3: senderAddress.street3,
              City: senderAddress.city,
              PostalCode: senderAddress.postalCode || ' ',
              CountryCode: senderAddress.countryCode,
              // 2 Letter statecode for the USA only
              // StateOrProvinceCode: senderAddress.province,
            },
          },
          Recipient: {
            Contact: {
              PersonName: `${receiverAddress.firstName || ''} ${receiverAddress.lastName || ''}`,
              CompanyName: receiverAddress.company,
              PhoneNumber: receiverAddress.phoneNumber,
              EmailAddress: receiverAddress.email,
              MobilePhoneNumber: receiverAddress.mobileNumber,
            },
            Address: {
              StreetLines: receiverAddress.street1,
              StreetLines2: receiverAddress.street2,
              StreetLines3: receiverAddress.street3,
              City: receiverAddress.city,
              PostalCode: receiverAddress.postalCode || ' ',
              CountryCode: receiverAddress.countryCode,
              // 2 Letter statecode for the USA only
              // StateOrProvinceCode: receiverAddress.province,
            },
          },
        },
        Packages: {
          RequestedPackages: requestedPackages,
        },
      },
    };

    if (shipperRegistrationNumbers) {
      const RegistrationNumber = _.map(shipperRegistrationNumbers, shipperRegistrationNumber => {
        return {
          Number: shipperRegistrationNumber.number,
          NumberTypeCode: shipperRegistrationNumber.numberTypeCode,
          NumberIssuerCountryCode: shipperRegistrationNumber.numberIssuerCountryCode,
        };
      });
      data.RequestedShipment.Ship.Shipper.RegistrationNumbers = {
        RegistrationNumber,
      };
    }
    if (recipientRegistrationNumbers) {
      const RegistrationNumber = _.map(recipientRegistrationNumbers, recipientRegistrationNumber => {
        return {
          Number: recipientRegistrationNumber.number,
          NumberTypeCode: recipientRegistrationNumber.numberTypeCode,
          NumberIssuerCountryCode: recipientRegistrationNumber.numberIssuerCountryCode,
        };
      });
      data.RequestedShipment.Ship.Recipient.RegistrationNumbers = {
        RegistrationNumber,
      };
    }

    // 如果是国际线产品码'P' 或 '8', 必须使用电子清关服务
    this.addCustomsDataIncludingSpecialService(
      data,
      parcels,
      dhlOptions,
      productCode,
      customsClearanceType,
      SpecialServices,
    );
    data.RequestedShipment.ShipmentInfo.SpecialServices = SpecialServices;

    // 自定义LOGO
    if (dhlOptions.enableCustomLogo) {
      const customerLogo = {
        LogoImage: Logo[channelConfig.platform],
        LogoImageFormat: 'PNG',
      };
      if (!data.RequestedShipment.ShipmentInfo['LabelOptions']) {
        data.RequestedShipment.ShipmentInfo['LabelOptions'] = {};
      }
      data.RequestedShipment.ShipmentInfo['LabelOptions']['CustomerLogo'] = customerLogo;
    }

    this._clearDeep(data);
    return data;
  }

  private validateSpecialServiceIsAvailable(specialServices): void {
    _.forEach(specialServices, specialService => {
      const supportableSpecialServices = ['INSURANCE_SERVICE', 'PAPERLESS_TRADE_SERVICE'];
      if (!supportableSpecialServices.includes(specialService)) {
        throw new BusinessException(`DHL not support the specialService: ${specialService}`);
      }
    });
  }

  private addCustomsDataIncludingSpecialService(
    data,
    parcels,
    dhlOptions: DhlOption,
    productCode: DhlProductCode,
    customsClearanceType: CustomsClearanceType,
    SpecialServices,
  ): void {
    if (CustomsClearanceType.NON_DOCUMENTS === customsClearanceType) {
      const requireDHLCustomsInvoice = dhlOptions.requireDHLCustomsInvoice
        ? RequireDHLCustomsInvoice.Y
        : RequireDHLCustomsInvoice.N;

      const found = _.find(dhlOptions.specialServices, specialService => specialService === 'PAPERLESS_TRADE_SERVICE');
      if (found) {
        data.RequestedShipment.ShipmentInfo.PaperlessTradeEnabled = true; // true/1
        SpecialServices.Service.push({
          ServiceType: SpecialServiceType.PAPERLESS_TRADE_SERVICE,
        });
      }
      let itemIndex = 1;
      const ExportLineItem = _.flatMap(parcels, parcel => {
        return parcel.items.map(item => {
          return {
            CommodityCode: item.hsCode,
            // 下面所有的都是必传字段
            ItemNumber: itemIndex++,
            Quantity: item.quantity,
            QuantityUnitOfMeasurement: 'PCS', // 数量计量单位: 件 or 个?
            ItemDescription: item.description,
            UnitPrice: item.value,
            NetWeight: _.round(MathCalculator.mul(item.weight, item.quantity), 2),
            GrossWeight: _.round(MathCalculator.mul(item.weight, item.quantity), 2),
            ManufacturingCountryCode: item.originCountry,
          };
        });
      });
      const ExportDeclaration = {
        InvoiceDate: dhlOptions.invoiceDate,
        InvoiceNumber: dhlOptions.invoiceNumber,
        ExportLineItems: {
          ExportLineItem,
        },
        ExportReason: _.head(parcels)?.options?.sendingReason || '', // 寄送原因
      };
      data.RequestedShipment.ShipmentInfo.LabelOptions = {
        DHLCustomsInvoiceType: dhlOptions.customsInvoiceType || CustomsInvoiceType.PROFORMA_INVOICE,
        RequestDHLCustomsInvoice: requireDHLCustomsInvoice || RequireDHLCustomsInvoice.Y,
      };
      data.RequestedShipment.InternationalDetail.ExportDeclaration = ExportDeclaration;
    }
  }

  private formatShippingDate(shippingDate): string {
    const momentObj = shippingDate ? moment(shippingDate) : moment();
    return momentObj.format('YYYY-MM-DDTHH:mm:ss') + 'GMT' + momentObj.format('Z');
  }

  private _clearDeep(obj) {
    if (!obj || typeof obj !== 'object') return;

    const keys = Object.keys(obj);
    for (const key of keys) {
      const val = obj[key];
      if (typeof val === 'undefined' || ((typeof val === 'object' || typeof val === 'string') && !val)) {
        // 如属性值为null或undefined或''，则将该属性删除
        delete obj[key];
      } else if (typeof val === 'object') {
        // 属性值为对象，递归调用
        this._clearDeep(obj[key]);

        if (Object.keys(obj[key]).length === 0) {
          // 如某属性的值为不包含任何属性的独享，则将该属性删除
          delete obj[key];
        }
      }
    }
  }
}
