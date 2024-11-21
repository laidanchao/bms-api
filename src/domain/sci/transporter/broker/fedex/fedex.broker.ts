import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import moment from 'moment';
import 'moment-timezone';
import _ from 'lodash';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { UploadEtdFileDto } from '@/domain/ord/parcel/dto/upload-etd-file.dto';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { FedexOption } from '@/domain/sci/transporter/broker/fedex/fedex.option';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/app/exception/business-exception';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';

@Injectable()
export class FedexBroker extends TransporterBroker {
  constructor() {
    super();
  }

  /**
   * Get label
   */
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/fedex/Ship.wsdl`,
      url: channelConfig.shipmentUrl,
      CustomerTransactionId: 'ProcessShipmentRequest_v23',
      Major: 23,
      timeout: 10000
    };
    const { accountInfo: account, labelFormat } = channelConfig;
    const { senderAddress, receiverAddress, parcel } = shipment;
    const { documentId, documentType } = <FedexOption>shipment.options;

    if (!parcel.items) {
      throw new BusinessException('parcel 中必须包含 items 参数');
    }

    const data = {
      WebAuthenticationDetail: {
        ParentCredential: {
          Key: account.Key,
          Password: account.Password,
        },
        UserCredential: {
          Key: account.Key,
          Password: account.Password,
        },
      },
      ClientDetail: {
        AccountNumber: account.AccountNumber,
        MeterNumber: account.MeterNumber,
      },
      TransactionDetail: {
        CustomerTransactionId: labelConfig.CustomerTransactionId,
      },
      Version: {
        ServiceId: 'ship',
        Major: labelConfig.Major,
        Intermediate: 0,
        Minor: 0,
      },
      RequestedShipment: {
        ShipTimestamp: moment(shipment.shippingDate).format(),
        DropoffType: 'REGULAR_PICKUP',
        // TODO xiewenzhen这里需要换上产品码
        ServiceType: channelConfig.productCode || 'INTERNATIONAL_ECONOMY',
        PackagingType: 'YOUR_PACKAGING',
        TotalInsuredValue: {
          Currency: 'EUR',
          Amount: parcel.insuranceValue || 0,
        },
        Shipper: {
          Tins: {
            TinType: senderAddress.taxInfo && senderAddress.taxInfo.taxType,
            Number: senderAddress.taxInfo && senderAddress.taxInfo.taxNumber,
          },
          Contact: {
            PersonName: `${senderAddress.firstName} ${senderAddress.lastName}`,
            CompanyName: senderAddress.company,
            PhoneNumber: senderAddress.mobileNumber || senderAddress.phoneNumber,
            EMailAddress: senderAddress.email,
          },
          Address: {
            StreetLines: formatStreet(senderAddress),
            City: senderAddress.city,
            PostalCode: senderAddress.postalCode,
            CountryCode: senderAddress.countryCode,
          },
        },
        Recipient: {
          Contact: {
            PersonName: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
            CompanyName: receiverAddress.company,
            PhoneNumber: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
            EMailAddress: receiverAddress.email,
          },
          Address: {
            StreetLines: formatStreet(receiverAddress),
            City: receiverAddress.city,
            StateOrProvinceCode: receiverAddress.province,
            PostalCode: receiverAddress.postalCode,
            CountryCode: receiverAddress.countryCode,
          },
        },
        ShippingChargesPayment: {
          PaymentType: 'SENDER',
          Payor: {
            ResponsibleParty: {
              AccountNumber: account.AccountNumber,
              Address: {
                CountryCode: senderAddress.countryCode,
              },
            },
          },
        },
        // TODO 有收件人邮箱的时候使用邮件通知,需要测试如果邮件为空的时候是否能通过
        SpecialServicesRequested: {
          SpecialServiceTypes: ['ELECTRONIC_TRADE_DOCUMENTS', 'EVENT_NOTIFICATION'],
          EventNotificationDetail: {
            EventNotifications: {
              Role: 'RECIPIENT',
              Events: ['ON_SHIPMENT', 'ON_ESTIMATED_DELIVERY', 'ON_EXCEPTION', 'ON_TENDER'],
              NotificationDetail: {
                NotificationType: 'EMAIL',
                EmailDetail: {
                  EmailAddress: receiverAddress.email,
                  Name: receiverAddress.lastName,
                },
                Localization: {
                  LanguageCode: 'EN',
                },
              },
              FormatSpecification: {
                Type: 'HTML',
              },
            },
          },
          // TODO xiewenzhen step1 这个与电子清关相关的代码, 目前只有速运在用. 如果有一个平台走该路线, 同时不使用电子清关, 这块代码需要重构.
          EtdDetail: {
            DocumentReferences: {
              DocumentType: documentType,
              DocumentId: documentId,
            },
          },
        },
        CustomsClearanceDetail: {
          DutiesPayment: {
            PaymentType: 'RECIPIENT',
          },
          DocumentContent: 'NON_DOCUMENTS',
          CustomsValue: {
            Currency: 'EUR',
            Amount: MathCalculator.sumBy(parcel.items, item => MathCalculator.mul(item.value, item.quantity)),
          },
          Commodities: formatItems(parcel.items),
          ExportDetail: {
            B13AFilingOption: 'NOT_REQUIRED',
          },
        },
        LabelSpecification: {
          LabelFormatType: 'COMMON2D',
          ImageType: labelFormat.labelType,
          LabelStockType: labelFormat.value,
        },
        RateRequestTypes: 'NONE',
        PackageCount: 1,
        RequestedPackageLineItems: {
          SequenceNumber: 1,
          Weight: {
            Units: 'KG',
            Value: parcel.weight,
          },
          Dimensions: {
            Length: 15,
            Width: 15,
            Height: 15,
            Units: 'CM',
          },
          CustomerReferences: [
            {
              CustomerReferenceType: 'INVOICE_NUMBER',
              Value: (<FedexOption>shipment.options).invoiceNumber || '',
            },
            {
              CustomerReferenceType: 'CUSTOMER_REFERENCE',
              Value: parcel.reference,
            },
          ],
        },
      },
    };

    if (_.isEmpty(senderAddress.taxInfo)) {
      delete data.RequestedShipment.Shipper.Tins;
    }

    checkTaxInfo();
    const client: any = await new Soap().createClient(labelConfig);
    let responses: any;
    try {
      responses = await client['processShipmentAsync'](data);
    } catch (err) {
      /*
      todo:  Fedex: Cannot read property 'MasterTrackingId' of undefined
          Fedex: Document ID is invalid
      */
      throw new TransporterException('Fedex', `${(!!err.detail && err.detail.desc) || err.message}`);
    }
    // await saveSoapLog(this.app, client, 'FEDEX', null);

    const response = responses[0];
    if (response['HighestSeverity'] === 'ERROR') {
      throw new TransporterException('Fedex', response['Notifications'][0]['Message'], client.lastRequest);
    }

    const MasterTrackingId = response['CompletedShipmentDetail']['MasterTrackingId'];
    const Label = response['CompletedShipmentDetail']['CompletedPackageDetails'][0]['Label'];
    return {
      trackingNumber: MasterTrackingId.TrackingNumber,
      shippingNumber: MasterTrackingId.TrackingNumber,
      label: Label.Parts[0].Image,
      labelFormat: Label.ImageType.toLowerCase(),
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
    };

    function checkTaxInfo() {
      if (
        !_.isEmpty(senderAddress.taxInfo) &&
        (_.isEmpty(senderAddress.taxInfo.taxType) || _.isEmpty(senderAddress.taxInfo.taxNumber))
      ) {
        throw new BusinessException('寄件人税号信息有误');
      }
      const types = ['BUSINESS_NATIONAL', 'BUISNESS_STATE', 'BUSINESS_UNION', 'PERSONAL_NATIONAL', 'PERSONAL_STATE'];
      if (!_.isEmpty(senderAddress.taxInfo) && !types.includes(senderAddress.taxInfo.taxType)) {
        throw new BusinessException('寄件人税务类型不合法');
      }
    }
  }

  /**
   * Get traces by tracking number
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const trackingArray = [];
    const traceConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/fedex/Track.wsdl`,
      url: 'https://ws.fedex.com:443/web-services/track',
      CustomerTransactionId: 'Track By Number_v16',
      Major: 16,
    };
    const client: any = await new Soap().createClient(traceConfig);

    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 100)) {
      const chunkTrackingArray = [];
      const promises = chunkTrackingNumberArray.map(async trackingNumber => {
        const data = {
          WebAuthenticationDetail: {
            ParentCredential: {
              Key: accountInfo.Key,
              Password: accountInfo.Password,
            },
            UserCredential: {
              Key: accountInfo.Key,
              Password: accountInfo.Password,
            },
          },
          ClientDetail: {
            AccountNumber: accountInfo.AccountNumber,
            MeterNumber: accountInfo.MeterNumber,
          },
          TransactionDetail: {
            CustomerTransactionId: traceConfig.CustomerTransactionId,
            Localization: {
              LanguageCode: 'ZH',
              LocaleCode: 'CN',
            },
          },
          Version: {
            ServiceId: 'trck',
            Major: traceConfig.Major,
            Intermediate: 0,
            Minor: 0,
          },
          SelectionDetails: {
            CarrierCode: 'FDXE',
            PackageIdentifier: {
              Type: 'TRACKING_NUMBER_OR_DOORTAG',
              Value: trackingNumber,
            },
            Destination: {
              GeographicCoordinates: 'rates evertitque aequora',
            },
          },
          ProcessingOptions: 'INCLUDE_DETAILED_SCANS',
        };

        const responses = await client['trackAsync'](data);
        if (responses[0].HighestSeverity === 'SUCCESS') {
          const Events = responses[0].CompletedTrackDetails[0].TrackDetails[0].Events;
          if (!!Events && !!Events.length) {
            const tracking = Events.map(event => ({
              trackingNumber: trackingNumber,
              event: event.EventType,
              timestamp: event.Timestamp,
              description: event.EventDescription,
              location: event.Address.City ? `${event.Address.City} ${event.Address.CountryCode}` : '',
            }));
            chunkTrackingArray.push(...tracking);
          }
        } else if (responses[0].HighestSeverity === 'ERROR') {
          const message = responses[0].Notifications[0].Message;
          console.error(message);
          // throw new TransporterException('Fedex', message);
        }
      });
      await Promise.all(promises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }

  // async handleTracking(parcel, trackingArray): Promise<Parcel> {
  //   try {
  //     for (const tracking of trackingArray) {
  //       //save last Event, last Description, last Timestamps
  //       parcel.lastEvent = tracking.event;
  //       parcel.lastDescription = tracking.description;
  //       parcel.lastTimestamps = tracking.timestamp;
  //       // tracking.trackingNumber = parcel.trackingNumber;
  //       if (parcel.status === 'CREATED' && 'PU' === tracking.event) {
  //         parcel.transferredAt = tracking.timestamp;
  //         parcel.status = 'DELIVERING';
  //       }
  //       if (parcel.status === 'CREATED' && 'CA' === tracking.event) {
  //         parcel.deletedAt = tracking.timestamp;
  //         parcel.status = 'DELETED';
  //       }
  //       if (parcel.status === 'DELIVERING' && 'DL' === tracking.event) {
  //         parcel.isArrived = true;
  //         parcel.arrivedAt = tracking.timestamp;
  //         parcel.status = 'ARRIVED';
  //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //         // @ts-ignore
  //         const aging = Moment.duration(parcel.arrivedAt - parcel.transferredAt, 'ms').asDays();
  //         parcel.aging = _.round(aging, 1);
  //       }
  //     }
  //   } catch (e) {
  //     this.dingTalkService.send(`${parcel.trackingNumber}:${e}`);
  //   }
  //   return parcel;
  // }

  /**
   *
   * @returns {Promise<void>}
   * @param dto
   * @param config
   */
  // async cancelShipment(trackingNumber, accountInfo) {
  async cancelShipment(dto: CancelParcelDto, config) {
    const voidConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/fedex/Ship.wsdl`,
      url: `${
        'staging' === process.env.NODE_ENV ? 'https://wsbeta.fedex.com' : 'https://ws.fedex.com'
      }/web-services/ship`,
      CustomerTransactionId: 'Delete Shipment',
      Major: 23,
    };
    const { shippingNumber } = dto;
    const { accountInfo } = config;
    const data = {
      WebAuthenticationDetail: {
        ParentCredential: {
          Key: accountInfo.Key,
          Password: accountInfo.Password,
        },
        UserCredential: {
          Key: accountInfo.Key,
          Password: accountInfo.Password,
        },
      },
      ClientDetail: {
        AccountNumber: accountInfo.AccountNumber,
        MeterNumber: accountInfo.MeterNumber,
      },
      TransactionDetail: {
        CustomerTransactionId: voidConfig.CustomerTransactionId,
      },
      Version: {
        ServiceId: 'ship',
        Major: voidConfig.Major,
        Intermediate: 0,
        Minor: 0,
      },
      TrackingId: {
        TrackingIdType: 'EXPRESS',
        TrackingNumber: shippingNumber,
      },
      DeletionControl: 'DELETE_ALL_PACKAGES',
    };
    const client: any = await new Soap().createClient(voidConfig);
    try {
      const responses = await client['deleteShipmentAsync'](data);
      return responses[0];
    } catch (e) {
      throw new TransporterException('Fedex', e.message);
    }
  }

  async uploadEtdFile(dto: UploadEtdFileDto, channelConfig: BaseConfig) {
    // TODO 移到config中去
    const uploadConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/fedex/UploadDocument.wsdl`,
      url: `${
        'staging' === process.env.NODE_ENV ? 'https://wsbeta.fedex.com' : 'https://ws.fedex.com'
      }/web-services/uploaddocument`,
      CustomerTransactionId: 'PRE_ETD_UploadDocumentsRequest_v11',
      Major: 11,
    };
    const { fileName, documentContent, originCountryCode, destinationCountryCode, documentType } = dto;

    const data = {
      WebAuthenticationDetail: {
        ParentCredential: {
          Key: channelConfig.accountInfo.Key,
          Password: channelConfig.accountInfo.Password,
        },
        UserCredential: {
          Key: channelConfig.accountInfo.Key,
          Password: channelConfig.accountInfo.Password,
        },
      },
      ClientDetail: {
        AccountNumber: channelConfig.accountInfo.AccountNumber,
        MeterNumber: channelConfig.accountInfo.MeterNumber,
      },
      TransactionDetail: {
        CustomerTransactionId: uploadConfig.CustomerTransactionId,
      },
      Version: {
        ServiceId: 'cdus',
        Major: uploadConfig.Major,
        Intermediate: 0,
        Minor: 0,
      },
      OriginCountryCode: originCountryCode,
      DestinationCountryCode: destinationCountryCode,
      Usage: 'ELECTRONIC_TRADE_DOCUMENTS',
      Documents: {
        LineNumber: 1,
        CustomerReference: '',
        DocumentProducer: 'CUSTOMER',
        DocumentType: documentType,
        FileName: fileName,
        DocumentContent: documentContent,
      },
    };
    const client: any = await new Soap().createClient(uploadConfig);
    const responses = await client['uploadDocumentsAsync'](data);
    if (responses[0].HighestSeverity === 'SUCCESS') {
      return responses[0].DocumentStatuses[0];
    } else if (responses[0].HighestSeverity === 'ERROR') {
      const message = responses[0].Notifications[0].Message;
      throw new TransporterException('Fedex', message);
    }
  }
}

function formatStreet(address) {
  // keep only two address streets
  return [address.street1, address.street2, address.street3].filter(street => street).slice(0, 2);
}

function formatItems(items) {
  return items.map(item => ({
    NumberOfPieces: 1, //The total number of packages within the shipment that contain this commodity
    Description: item.description,
    CountryOfManufacture: item.originCountry,
    Weight: {
      Units: 'KG',
      Value: item.weight, //Total weight of this commodity
    },
    Quantity: item.quantity, //Total quantity of an individual commodity within the shipment
    QuantityUnits: 'EA',
    UnitPrice: {
      Currency: 'EUR',
      Amount: item.value,
    },
  }));
}
