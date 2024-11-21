import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { AddressDto, CreateParcelResponse, ParcelDto } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Injectable } from '@nestjs/common';
import { Logger } from '@/app/logger';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import crypto from 'crypto';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { classToPlain } from 'class-transformer';
import RemoveAccents from 'remove-accents';
import { Moment } from '@softbrains/common-utils';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { PointRelayDetail, RelayPointDTO } from '@/domain/sci/transporter/broker/mr/mr.constraint';
import Xml2js from 'xml2js';
import request from 'request-promise';
import { XmlParser } from '@/domain/sci/transporter/broker/common/xml-parser';
import { Transporter } from '@/domain/utils/Enums';
import { delay, getHttpAgent } from '@/domain/utils/util';

@Injectable()
export class MrBroker extends TransporterBroker {
  errorCodeMap = {
    '0': 'Successfull operation',
    '1': 'Incorrect merchant',
    '2': 'Merchant number empty',
    '3': 'Incorrect merchant account number',
    '4': '',
    '5': 'Incorrect Merchant shipment reference',
    '6': '',
    '7': 'Incorrect Consignee reference (Field NCLIENT)',
    '8': 'Incorrect password or hash',
    '9': 'Unknown or not unique city',
    '10': 'Incorrect type of collection',
    '11': 'Point Relais® collection number incorrect',
    '12': 'Point Relais® collection country.incorrect',
    '13': 'Incorrect type of delivery',
    '14': 'Incorrect delivery Point Relais® number',
    '15': 'Point Relais delivery country.incorrect',
    '16': '',
    '17': '',
    '18': '',
    '19': '',
    '20': 'Incorrect parcel weight',
    '21': 'Incorrect developped lenght (length + height)',
    '22': 'Incorrect parcel size',
    '23': '',
    '24': 'Incorrect shipment number',
    '25': '',
    '26': 'Incorrect assembly time',
    '27': 'Incorrect mode of collection or delivery',
    '28': 'Incorrect mode of collection',
    '29': 'Incorrect mode of delivery',
    '30': 'Incorrect address (L1)',
    '31': 'Incorrect address (L2)',
    '32': '',
    '33': 'Incorrect address (L3)',
    '34': 'Incorrect address (L4)',
    '35': 'Incorrect city',
    '36': 'Incorrect zipcode',
    '37': 'Incorrect country',
    '38': 'Incorrect phone number',
    '39': 'Incorrect e-mail',
    '40': 'Missing parameters',
    '41': '',
    '42': 'Incorrect COD value',
    '43': 'Incorrect COD currency',
    '44': 'Incorrect shipment value',
    '45': 'Incorrect shipment value currency',
    '46': 'End of shipments number range reached',
    '47': 'Incorrect number of parcels',
    '48': 'Multi-Parcel not permitted at Point Relais®',
    '49': 'Incorrect action',
    '50': '',
    '51': '',
    '52': '',
    '53': '',
    '54': '',
    '55': '',
    '56': '',
    '57': '',
    '58': '',
    '59': '',
    '60': 'Incorrect text field (this error code has no impact)',
    '61': 'Incorrect notification request',
    '62': 'Incorrect extra delivery information',
    '63': 'Incorrect insurance',
    '64': 'Incorrect assembly time',
    '65': 'Incorrect appointement',
    '66': 'Incorrect take back',
    '67': 'Incorrect latitude',
    '68': 'Incorrect longitude',
    '69': 'Incorrect merchant code',
    '70': 'Incorrect Point Relais® number',
    '71': 'Incorrect Nature de point de vente non valide',
    '72': '',
    '73': '',
    '74': 'Incorrect language',
    '75': '',
    '76': '',
    '77': '',
    '78': 'Incorrect country of collection',
    '79': 'Incorrect country of delivery',
    '80': 'Tracking code : Recorded parcel',
    '81': 'Tracking code : Parcel in process at Mondial Relay',
    '82': 'Tracking code : Delivered parcel',
    '83': 'Tracking code : Anomaly',
    '84': '(Reserved tracking code)',
    '85': '(Reserved tracking code)',
    '86': '(Reserved tracking code)',
    '87': '(Reserved tracking code)',
    '88': '(Reserved tracking code)',
    '89': '(Reserved tracking code)',
    '90': '',
    '91': '',
    '92':
      'The Point Relais® country code and the consignee’s country code are different. Or Insufficient funds (pre-payed accounts)',
    '93':
      'No information given by the sorting plan. If you want to do a collection or delivery at Point Relais, please check it is avalaible. If you want to do a home delivery, please check if the zipcode exists.',
    '94': 'Unknown parcel',
    '95': 'Merchant account not activated',
    '96': '',
    '97': 'Incorrect security key Cf. : § « Generating the security key »',
    '98':
      'Generic error (Incorrect parameters) This error hides another error from the list and can only happen in production mode. Cf. : § « Normal functionality and debugging »',
    '99':
      'Generic error of service system This error can happen due to a technical service problem. Please notify this error to Mondial Relay with the date and time of the request as well as the parameters sent in order to verify',
  };

  // REST API 报错code和描述
  errorCodeMap2 = {
    '-1': 'Severe System Error. Please, contact the Service Center.',
    '10000':
      'A general error occurred during authentication. Check that the login or/and password are correctly filled.',
    '10001': 'Invalid user and/or password. Check the authentication information.',
    '10002':
      'A general error occurred while checking configuration. Check that the customerId field is correctly filled.',
    '10003': 'A general error occurred while checking configuration. Check that the culture field is correctly filled.',
    '10004':
      'A general error occurred while checking configuration. Check that the VersionAPI field is correctly filled.',
    '10005': 'A general error occurred while checking configuration. Unknown customer Id.',
    '10006': 'A general error occurred while checking configuration. Unknown culture.',
    '10007': 'A general error occurred while checking configuration. Unknown VersionAPI.',
    '10008': 'Unknown outputFormat. Statement ignored.',
    '10009': 'No output type defined in the output options.',
    '10010': 'Invalid output type defined in the output options.',
    '10011':
      'A general error occurred while checking shipments List. No shipment entity defined in the request. A request must contain at least one return element.',
    '10012': 'No sender information defined in the shipment request.',
    '10013': 'No receiver information defined in the shipment request.',
    '10014': 'Invalid order number. Statement ignored.',
    '10015': 'Invalid customer reference defined in the shipment entity. Statement ignored.',
    '10016': 'No parcel count defined in the shipment entity.',
    '10017': 'Invalid parcel count.',
    '10018': 'Invalid amount defined in the shipment. Statement ignored.',
    '10019': 'Invalid shipmentValue defined in the shipment. Statement ignored.',
    '10020': 'Invalid currency. Statement ignored. R',
    '10021': 'Invalid option key. Statement ignored.',
    '10022': 'Invalid option value. Statement ignored.',
    '10023': 'No delivery mode defined in the request.',
    '10024': 'Invalid delivery mode defined in the request.',
    '10025': 'Invalid location for the delivery mode. Statement ignored.',
    '10026': 'No Collection Mode defined in the request.',
    '10027': 'Invalid Collection Mode defined in the request.',
    '10028': 'Invalid location for the collection mode. Statement ignored.',
    '10029': 'Invalid content. Statement ignored.',
    '10030': 'Invalid length. Statement ignored.',
    '10031': 'Invalid width. Statement ignored.',
    '10032': 'Invalid depth. Statement ignored.',
    '10033': 'No weight defined in the parcel element.',
    '10034': 'Invalid weight.',
    '10035': 'Invalid delivery Instruction. Statement ignored.',
    '10036': 'Invalid Title defined in the address. Statement ignored.',
    '10037': 'Invalid first name defined in the address. Statement ignored.',
    '10038': 'Invalid last name defined in the address. Statement ignored.',
    '10039': 'Invalid street name defined in the address.',
    '10040': 'No street name defined in the address.',
    '10041': 'Invalid house Number defined in the address. Statement ignored.',
    '10042': 'Invalid country code defined in the address.',
    '10043': 'No country code defined in the address.',
    '10044': 'Invalid postcode defined in the address.',
    '10045': 'No postcode defined in the address.',
    '10046': 'Invalid city defined in the address.',
    '10047': 'No city defined in the address.',
    '10048': 'Invalid Additional address field 1 defined in the address. Statement ignored.',
    '10049': 'Invalid Additional address field 2 defined in the address. Statement ignored.',
    '10050': 'Invalid Additional address field 3 defined in the address. Statement ignored.',
    '10051': 'Invalid phone number defined in the address. Statement ignored.',
    '10052': 'Invalid mobile number defined in the address. Statement ignored.',
    '10053': 'Invalid email defined in the address. Statement ignored.',
    '10054': 'Unknown address.',
    '10055': 'Unable to determine transportation plan for this sender address.',
    '10056': 'Unable to determine transportation plan for this receiver address.',
    '10057': 'Routing is not needed. No routing will be created.',
    '10058': 'Routing not completed.',
    '10059': 'Routing denied.',
    '10060': 'Label could not be generated for this request.',
    '10061': 'Not Well-formed XML request.',
    '10062': 'Title + FirstName + LastName should not be greater than 30 characters.',
    '10063': 'HouseNo + StreetName should not be greater than 30 characters.',
    '10065': 'The number of parcel elements is different from the parcelCount defined in the shipment. ',
    '10066': 'A general error occurred while checking configuration. No access right.',
    '10067': 'No configuration for your business.',
    '10068': 'Unable to get the partner barcode.',
    '10069': 'Postal code modified by the partner for routing purpose.',
    '10070': 'Multi parcels forbidden for this product code.',
    '10071': 'Collection location not found.',
    '10072': 'Location not allowed for your business. Please refer to your binding agreement. ',
    '10073': 'Location not allowed for this shipment.',
    '10074': 'No allowed location for this product code.',
    '10075': 'Llocation not allowed for this product code.',
    '10076': 'Unauthorized option for this product code.',
    '10077': 'No compatible label for this printer.',
    '10078': 'No available label for this shipment.',
    '10079': 'Invalid country code for your customer settings.',
    '10080': 'PDF File unavailable.',
    '10081': 'Unable to join the partner.',
    '99998':
      'XML Parse error. This error will return the specific reason of the reject. You can check your XML request via the XML validator link specify in the policy part.',
    '99999': 'An error occurred. Please contact the Service Center',
  };

  pdfUtil = new PdfUtil();

  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const options: any = classToPlain(shipment.options) || {};
    const service = 'api/shipment';
    const data: any = this._buildXmlString(shipment, channelConfig);
    // 2.请求MR供应
    const requestOptions = {
      uri: `${channelConfig.shipmentUrl}${service}`,
      method: 'POST',
      headers: { Accept: 'application/xml', 'Content-Type': 'text/xml' },
      body: data,
    };
    const response = await request(requestOptions);
    const resultObject: any = new XmlParser().parseXmlString2Obj(response);
    const Status = resultObject.ShipmentCreationResponse.StatusList.Status;
    const statusResultArray = _.isArray(Status) ? Status : [Status];
    const isSuccess = !!resultObject.ShipmentCreationResponse?.ShipmentsList?.Shipment?.$?.ShipmentNumber || false;
    if (!isSuccess) {
      let errorMsg = '';
      _.chain(statusResultArray)
        .uniqBy('$.Code')
        .map(v => {
          errorMsg += `错误代码 ${v.$.Code},错误描述 ${v.$.Level} ${
            this.errorCodeMap2[v.$.Code] ? this.errorCodeMap2[v.$.Code] : v.$.Message
          };`;
        })
        .value();
      throw new TransporterException('MR', `下单异常 ${errorMsg}`, data);
    }
    // 3.返回包裹信息
    const shipmentResult = resultObject.ShipmentCreationResponse.ShipmentsList.Shipment;
    const rawContent = shipmentResult.LabelList.Label?.RawContent;
    const result = {
      shippingNumber: shipmentResult.$.ShipmentNumber,
      trackingNumber: shipmentResult.$.ShipmentNumber,
      label: shipmentResult.LabelList.Label.Output,
      labelFormat: channelConfig.labelFormat.labelType,
      transporterRequest: data,
      transporterResponse: response,
      barCode: rawContent?.Barcodes?.Barcode?.$?.Value || '',
    };
    if (!process.env.NODE_ENV.includes('production')) {
      result.barCode = result.trackingNumber;
    }

    const labelType = channelConfig.labelFormat.labelType.toUpperCase();
    if (options.labelEncoding === 'BASE64' && labelType.includes('PDF')) {
      result.label = await axios
        .get(result.label, { responseType: 'arraybuffer' })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'));
    }
    result.label = await this.pdfUtil.drawLogoOnLabel(
      result.label,
      channelConfig.platform,
      channelConfig.transporterId,
      channelConfig.labelFormat.code,
      options.enableCustomLogo,
    );
    return result;
  }

  async searchRelayPointLocation(relayPointDTO: RelayPointDTO, channelConfig: BaseConfig): Promise<PointRelayDetail[]> {
    const account = channelConfig.accountInfo;
    const requestBody = {
      Enseigne: account.enseigne,
      Pays: relayPointDTO.countryCode, // 必填
      NumPointRelais: relayPointDTO.relayPointId,
      Ville: undefined, // 不适用
      CP: relayPointDTO.zipCode,
      Latitude: relayPointDTO.latitude,
      Longitude: relayPointDTO.longitude,
      Taille: relayPointDTO.size,
      Poids: relayPointDTO.weight,
      Action: relayPointDTO.action,
      DelaiEnvoi: undefined,
      RayonRecherche: relayPointDTO.searchRadius,
      TypeActivite: relayPointDTO.tradeType,
      NACE: undefined,
      NombreResultats: relayPointDTO.numberOfResults || 10, // 必填
      Security: relayPointDTO.security,
    };

    const data = this._signedForData(requestBody, account);

    // 2.请求MR供应
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/mr/MR.wsdl`,
      url: 'https://api.mondialrelay.com/Web_Services.asmx', // 测试和正式都是同一个请求地址（账号不一样）
      timeout: 10000,
    };
    const client: any = await new Soap().createClient(labelConfig);
    const responses = await new Promise(resolve => resolve(client['WSI4_PointRelais_RechercheAsync'](data))).catch(
      err => err,
    );
    if (responses[0].WSI4_PointRelais_RechercheResult.STAT !== '0') {
      throw new TransporterException(
        'MR',
        `查询中继点发生错误, 错误代码 ${responses[0].WSI4_PointRelais_RechercheResult.STAT}。错误描述 ${
          this.errorCodeMap[responses[0].WSI4_PointRelais_RechercheResult.STAT]
        }`,
      );
    }
    const result = responses[0].WSI4_PointRelais_RechercheResult.PointsRelais.PointRelais_Details;
    return result;
  }

  _signedForData(data: any, account: Record<string, string>) {
    data = _.mapValues(data, value => {
      if (typeof value === 'string') {
        const v = RemoveAccents.remove(value);
        return v.replace(/[\u4e00-\u9fa5]/g, '');
      } else {
        return value;
      }
    });

    const bodyData = _.reduce(
      data,
      (result, value) => {
        return value === null || value === undefined ? result : result + value;
      },
      '',
    );
    const privateKey = account.privateKey;
    const dataS = Buffer.from(bodyData + privateKey).toString('utf8');
    const security = crypto
      .createHash('md5')
      .update(dataS)
      .digest('hex')
      .toUpperCase();
    data.Security = security;
    return data;
  }

  private _buildXmlString(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const options: any = classToPlain(shipment.options) || {};
    const accountInfo = channelConfig.accountInfo;
    const labelFormat = channelConfig.labelFormat;
    const receiverAddress = shipment.receiverAddress;
    const senderAddress = shipment.senderAddress;
    const parcel: ParcelDto = shipment.parcel;
    accountInfo.collectionMode = options?.collectionMode ? options.collectionMode : 'CCC';
    let option = {};
    if (parcel.insuranceValue > 0) {
      option = { Option: { $: { Key: 'ASS', Value: '' } } };
    }
    const outputType = this._transferOutputFormat(labelFormat.labelType);
    const xmlObject = {
      ShipmentCreationRequest: {
        $: {
          xmlns: 'http://www.example.org/Request',
        },
        Context: {
          Login: accountInfo.login,
          Password: accountInfo.password,
          CustomerId: accountInfo.customerId,
          Culture: 'fr-FR',
          VersionAPI: accountInfo.versionAPI,
        },
        OutputOptions: {
          OutputFormat: labelFormat.value,
          OutputType: outputType,
        },
        ShipmentsList: {
          Shipment: {
            OrderNo: '',
            CustomerNo: '',
            ParcelCount: !!parcel && 1,
            DeliveryMode: {
              $: {
                Mode: channelConfig.productCode,
                Location:
                  options.relayCountry && options.relayPointId ? `${options.relayCountry}-${options.relayPointId}` : '',
              },
            },
            CollectionMode: {
              $: {
                Mode: accountInfo.collectionMode,
                Location: '',
              },
            },
            Parcels: {
              Parcel: {
                Content: parcel.reference || 'FTL' + uuidv4().substring(0, 12),
                Weight: {
                  $: {
                    Value: MathCalculator.mul(parcel.weight, 1000),
                    Unit: 'gr',
                  },
                },
              },
            },
            DeliveryInstruction: '',
            Sender: {
              Address: {
                Title: '',
                Firstname: senderAddress.firstName || '',
                Lastname: senderAddress.lastName || '',
                Streetname: senderAddress.street3, // 必填 面单排版在street2后面
                HouseNo: '',
                CountryCode: senderAddress.countryCode,
                PostCode: senderAddress.postalCode,
                City: senderAddress.city,
                AddressAdd1: senderAddress.street1 || '', // 必填
                AddressAdd2: senderAddress.street2 || '',
                AddressAdd3: '',
                PhoneNo: senderAddress.phoneNumber || '',
                MobileNo: senderAddress.mobileNumber || '',
                Email: senderAddress.email || '',
              },
            },
            Recipient: {
              Address: {
                Title: '',
                Firstname: receiverAddress.firstName || '',
                Lastname: receiverAddress.lastName || '',
                Streetname: receiverAddress.street3, // 必填 面单排版在street2后面
                HouseNo: '',
                CountryCode: receiverAddress.countryCode,
                PostCode: receiverAddress.postalCode,
                City: receiverAddress.city,
                AddressAdd1: receiverAddress.street1 || '', // 必填
                AddressAdd2: receiverAddress.street2 || '',
                AddressAdd3: '',
                PhoneNo: receiverAddress.phoneNumber || '',
                MobileNo: receiverAddress.mobileNumber || '',
                Email: receiverAddress.email || '',
              },
            },
            Options: option,
          },
        },
      },
    };
    return new Xml2js.Builder().buildObject(xmlObject);
  }
  _transferOutputFormat(type) {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'PdfUrl';
      case 'zpl':
        return 'ZplCode';
      case 'ipl':
        return 'IplCode';
      case 'qr':
        return 'QRCode';
      default:
        break;
    }
  }
  /**
   * NOTE: 通过api获取包裹轨迹 需要使用包裹下单时的账号
   *
   * @param trackingNumberArray
   * @param accountInfo
   * @param language
   */
  async fetchTrackingOfficial({ trackingNumberArray, accountInfo, language = 'EN' }): Promise<any[]> {
    const trackingArray = [];
    try {
      for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 20)) {
        const promises = chunkTrackingNumberArray.map(async trackingNumber => {
          let data: any = {
            Enseigne: accountInfo.enseigne,
            Expedition: trackingNumber,
            Langue: language,
          };
          data = this._signedForData(data, accountInfo);
          const trackingConfig = {
            wsdl: `${process.cwd()}/src/assets/wsdl/mr/MR.wsdl`,
            url: 'https://api.mondialrelay.com/Web_Services.asmx',
            timeout: 10000,
          };
          const client: any = await new Soap().createClient(trackingConfig);
          const response = await client['WSI2_TracingColisDetailleAsync'](data);
          const statusCode = response[0].WSI2_TracingColisDetailleResult.STAT;
          if (statusCode >= '80' && statusCode <= '83') {
            const tracking = this._toTracking(trackingNumber, response[0].WSI2_TracingColisDetailleResult);
            trackingArray.push(...tracking);
          } else {
            Logger.error(
              `MR: ${trackingNumber}获取跟踪轨迹异常 错误代码 ${statusCode}。错误描述 ${this.errorCodeMap[statusCode]}`,
            );
          }
        });
        await Promise.all(promises);
      }
    } catch (e) {
      Logger.error(e);
    }

    return trackingArray;
  }

  async fetchTrackingUnofficial2({ trackingNumberPostCodeArray }, cmsEvents) {
    const firstTrackingNumber = 'mr:' + trackingNumberPostCodeArray[0]?.trackingNumber;

    try {
      const trackingArray = [];
      console.time(firstTrackingNumber);

      console.log(`${firstTrackingNumber}等等${trackingNumberPostCodeArray.length}个单号开始爬取...`);
      for (const { trackingNumber, postCode } of trackingNumberPostCodeArray) {
        const result = await this.singleTrackingRequest(trackingNumber, postCode);
        trackingArray.push(...result);
        await delay(1000);
      }
      console.timeLog(firstTrackingNumber, `${firstTrackingNumber}等等,爬取结束!`);

      console.timeEnd(firstTrackingNumber);
      const result = await super.descMapHandle(Transporter.MONDIAL_RELAY, trackingArray, cmsEvents, false);
      return {
        ...result,
        failedTrackingNumberArray: [],
      };
    } catch (e) {
      console.timeEnd(firstTrackingNumber);
      Logger.warn('MR tracking: ' + e.message);
      return {
        clearCache: true,
        trackingArray: [],
        failedTrackingNumberArray: [],
      };
    }
  }

  private _toTracking(trackingNumber, trackingInfo) {
    const rawTrackingArray = this._filterEmptyTrackingInfo(trackingInfo);
    return rawTrackingArray.map(item => {
      return {
        trackingNumber: trackingNumber,
        timestamp: Moment.tz(`${item.Date} ${item.Heure}`, 'DD/MM/YY HH:mm', 'Europe/Paris').toDate(),
        event: item.Libelle,
        description: item.Libelle,
        location: item.Lieu,
      };
    });
  }

  private _filterEmptyTrackingInfo(trackingInfo) {
    const rawTrackingArray = trackingInfo.Tracing.ret_WSI2_sub_TracingColisDetaille;
    return _.filter(rawTrackingArray, item => item.Libelle);
  }

  private async singleTrackingRequest(trackingNumber: string, postCode: string) {
    // token可能过期
    const token =
      'CYO8vTgcj58RLepKy0Ap_MsUTN2orZs_6t-j3LwkA1YCYnHlRMs7Sj_qCzxPgLqTfUo-lhv-d8jbY6AlnV5gATU6fbU1:DDv98A2EGcfzPxyJ-HW33a6CnqZDjCB3iV2FaZFAYc43qm3YxFACj1jl-YiWZ6bj9X3G60upnX9VDZOwr8AI6L-8PY01';
    const url = `https://www.mondialrelay.fr/api/tracking?shipment=${trackingNumber}&postcode=${postCode}`;
    const agent = getHttpAgent();
    try {
      const response = await axios.request({
        url,
        method: 'get',
        headers: {
          Requestverificationtoken: token,
        },
        httpAgent: agent,
        httpsAgent: agent,
      });
      const data = response.data.Expedition;
      return data.Evenements.map(rawTracking => {
        return {
          trackingNumber: trackingNumber,
          event: '',
          timestamp: Moment.tz(rawTracking.Date, 'Europe/Paris').toDate(),
          description: rawTracking.Libelle,
          fromFile: false,
        };
      });
    } catch (e) {
      Logger.warn('MR tracking: ' + e.message);
      return [];
    }
  }
}
