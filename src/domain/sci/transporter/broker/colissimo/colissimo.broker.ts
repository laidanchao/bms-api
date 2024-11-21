import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { Injectable } from '@nestjs/common';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import moment from 'moment';
import _ from 'lodash';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import 'moment-timezone';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { ColissimoErrorMessage } from '@/domain/sci/transporter/broker/colissimo/colissimo-error-message';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { ColissimoOption } from '@/domain/sci/transporter/broker/colissimo/colissimo.option';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ParcelOption } from '@/domain/ord/dto/parcel.option';
import * as math from 'mathjs';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { LaposteTracking } from '@/domain/sci/transporter/broker/common/laposte-tracking';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { ParcelPolicy } from '@/domain/job/sct/policy/parcel-policy';
import { Logger } from '@/app/logger';
import { Transporter } from '@/domain/utils/Enums';

@Injectable()
export class ColissimoBroker extends TransporterBroker {
  cookie: any;

  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    // eslint-disable-next-line prefer-const
    let { senderAddress, receiverAddress } = shipment;

    const CMOption = <ColissimoOption>shipment.options || {};

    const { parcel } = shipment;

    const ParcelOption = <ParcelOption>parcel.options || {};

    const serviceCode = channelConfig.productCode;

    const { contractNumber, password } = channelConfig.accountInfo;

    const data = {
      generateLabelRequest: {
        contractNumber,
        password,
        outputFormat: {
          outputPrintingType: channelConfig.labelFormat.value,
        },
        letter: {
          service: {
            productCode: serviceCode,
            // 下单时间
            depositDate: formatShippingDate(shipment.shippingDate),
            totalAmount: 0,
            orderNumber: parcel.reference || '',
            commercialName: CMOption.commercialName || '',
            returnTypeChoice: 2,
          },
          parcel: {
            // !!!法邮保险金额也要*100
            insuranceValue: math.multiply(math.bignumber(shipment.parcel.insuranceValue || 0), 100).toString(), //Pass 1230 for €12.30 This value is rounded to the nearest whole number (e.g. 12 euros if 1232 is sent)
            weight: parcel.weight,
            nonMachinable: false,
            COD: false,
            returnReceipt: false,
            instructions: parcel.instructions || '',
            pickupLocationId: CMOption.relayPointId || '',
          },
          customsDeclarations: {},
          sender: {
            senderParcelRef: parcel.reference,
            address: {
              companyName: senderAddress.company,
              lastName: senderAddress.lastName,
              firstName: senderAddress.firstName,
              line0: senderAddress.street2,
              line1: senderAddress.street3,
              line2: senderAddress.street1,
              countryCode: senderAddress.countryCode,
              city: senderAddress.city,
              zipCode: senderAddress.postalCode,
              phoneNumber: senderAddress.phoneNumber,
              mobileNumber: senderAddress.mobileNumber,
              email: senderAddress.email || '',
              language: 'FR',
            },
          },
          addressee: {
            addresseeParcelRef: parcel.reference,
            address: {
              companyName: receiverAddress.company,
              lastName: receiverAddress.lastName,
              firstName: receiverAddress.firstName,
              line0: receiverAddress.street2, //line0: Etage, couloir,escalier, n°d’appartement
              line1: receiverAddress.street3, //line1: Entrée, bâtiment, immeuble, résidence
              line2: receiverAddress.street1, //line2: Numéro et libellé de voie
              countryCode: receiverAddress.countryCode,
              city: receiverAddress.city,
              zipCode: receiverAddress.postalCode,
              phoneNumber: receiverAddress.phoneNumber,
              mobileNumber: receiverAddress.mobileNumber,
              email: receiverAddress.email || '',
              language: 'FR',
            },
          },
        },
        // !!! 固定不变的
        fields: {
          field: [
            { key: 'PRINT_CUSTOMER_BARCODE', value: 2 },
            // !!! EORI 注意field 如果没有值, 必须要传一个"空格"
            { key: 'EORI', value: senderAddress['EORI'] || ' ' },
          ],
        },
      },
    };
    // TODO move this to data
    if (parcel.items && parcel.items.length > 0) {
      // 这属于很差的代码
      const totalAmount =
        MathCalculator.sumBy(parcel.items, item => MathCalculator.mul(item.value, item.quantity)) * 100;

      data.generateLabelRequest.letter.service.totalAmount = _.round(totalAmount, 0);
      data.generateLabelRequest.letter.customsDeclarations = {
        includeCustomsDeclarations: 1,
        contents: {
          article: formatItems(parcel.items),
          category: {
            value: ParcelOption.customsCategory || CMOption.customsCategory || 2,
          },
        },
      };
      if (CMOption.invoiceNumber) {
        data.generateLabelRequest.letter.customsDeclarations['invoiceNumber'] = CMOption.invoiceNumber;
      }
      if (CMOption.totalAmount) {
        // 这属于很差的代码
        data.generateLabelRequest.letter.service.totalAmount = MathCalculator.mul(CMOption.totalAmount, 100);
      }
    }
    TransporterUtils.omitEmptyProps(data);
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/colissimo/Label.wsdl`,
      url: channelConfig.shipmentUrl,
      stream: true,
      timeout: 7000,
    };
    const startTime = new Date().getTime();
    const client: any = await new Soap().createClient(labelConfig, null);
    const responses = await client['generateLabelAsync'](data);
    const endTime = new Date().getTime();
    Logger.info(`docker url: ${channelConfig.shipmentUrl}`);
    Logger.info(`COLISSIMO docker duration: ${(endTime - startTime) / 1000} s`);

    if (!responses[0].return || _.isEmpty(responses[0].return.messages)) {
      throw new TransporterException('CM', 'No response from COLISSIMO', client.lastRequest);
    }

    const {
      messages: [message],
      labelV2Response,
    } = responses[0].return;

    if (message.type === 'ERROR') {
      // 业务错误
      throw new TransporterException('CM', errorMessageTranslate(message), client.lastRequest);
    }

    // handle response
    const { parcelNumber, parcelNumberPartner: barCode } = labelV2Response;
    let label = responses[1][1].toString('base64');
    // 测试环境给label 加上水印
    if ('staging' === process.env.NODE_ENV) {
      label = await new PdfUtil().drawCMSSTAGINGLogo(label);
    }

    const result: CreateParcelResponse = {
      trackingNumber: parcelNumber,
      shippingNumber: parcelNumber,
      label: label,
      labelFormat: channelConfig.labelFormat.labelType,
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
      instructions: parcel.instructions,
      barCode,
    };
    if (responses[1][2]) {
      result.cn23 = responses[1][2].toString('base64');
    }
    return result;
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
      Transporter.COLISSIMO,
    );
    return {
      trackingArray,
      failedTrackingNumberArray,
    };
  }

  async fetchTrackingFromOSC({ trackingNumberArray, accountInfo }) {
    return new LaposteTracking().fetchTrackingFromOSC(trackingNumberArray, accountInfo);
  }

  /**
   * @deprecated
   */
  async handleTracking(parcel, trackingArray) {
    const copyOfParcel = _.cloneDeep(parcel);
    for (const tracking of trackingArray) {
      if (parcel) {
        //save last Event, last Description, last Timestamps
        parcel.lastEvent = '' + tracking.event;
        parcel.lastDescription = '' + tracking.description;
        parcel.lastTimestamps = new Date(tracking.timestamp);
        // TODO xiewenzhen parcel包裹的状态是最新态, 应该有最后一个轨迹节点的信息, 去决定. 因此, 不能因单个轨迹点孤立地轨迹节点信息, 而跟新包裹状态.
        //  重新做一个更新包裹状态的方法. 这里只处理除包裹状态之外的包裹信息.
        //  缺点, 是会多次查询数据库
        //  优点, 保证了数据的正确性
        //  数据的正确性, 是CMS目前做为重要的. 因此, 牺牲性能换取, 正确性是值得的.
        //DELIVERING
        if (
          ['PCH_CFM', 'AAR_CFM', 'MLV_CFM', 'RST_FHB', 'PCH_TAR', 'DCH_DDT'].includes(tracking.event) &&
          // TODO xiewenzhen 这里可以运用到所有事件中, 让事件不能回退.
          !['ARRIVED', 'DELIVERING'].includes(parcel.status)
        ) {
          parcel.status = 'DELIVERING';
        }

        if (['PCH_CFM', 'AAR_CFM', 'MLV_CFM', 'RST_FHB', 'PCH_TAR', 'DCH_DDT', 'PCH_CEX'].includes(tracking.event)) {
          parcel.transferredAt = getEarlierDate(parcel.transferredAt, tracking.timestamp);
        }

        //RETURNED SLO_REO为开始退货; LIV_REO退回到寄件人;
        if (
          [
            'SOL_REO',
            'LIV_REO',
            'DCH_RCA',
            'REN_DIA',
            'PCH_CHM',
            'DCH_RCA',
            'REN_AVA',
            'REN_DID',
            'REN_DIV',
            'REN_SRB',
            'REN_TAR',
            'REN_SNC',
          ].includes(tracking.event)
        ) {
          parcel.isReturned = true;
          parcel.status = 'RETURNED';
          parcel.returnedAt = tracking.timestamp;
        }

        if (['LIV_GAR', 'LIV_RTI', 'LIV_VOI', 'LIV_CFM', 'MLV_ARX', 'MLV_ARS'].includes(tracking.event)) {
          parcel.arrivedAt = getLaterDate(parcel.arrivedAt, tracking.timestamp);
          parcel.status = 'ARRIVED';
          parcel.isArrived = true;
        }

        if (parcel.transferredAt && parcel.arrivedAt) {
          const aging = moment.duration(parcel.arrivedAt - parcel.transferredAt, 'ms').asDays();
          parcel.aging = _.round(aging, 1);
        }
      }
    }
    ParcelPolicy.isSetSync(parcel, copyOfParcel);
    return parcel;
  }
}

const FREQUENTLY_OCCUR_ERROR = {
  POSTAL_CODE_INCONSISTENT: 'The city and postal code is inconsistent. Please correct the destination information.',
};

function errorMessageTranslate(errorMessage: ColissimoErrorMessage) {
  if (errorMessage.id === 'GEO_ROUTING_R102') {
    return FREQUENTLY_OCCUR_ERROR.POSTAL_CODE_INCONSISTENT;
  }
  return errorMessage.messageContent;
}

function formatShippingDate(date) {
  return moment.tz(date, 'Europe/Paris').format('YYYY-MM-DD');
}

function formatItems(items) {
  return items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    weight: item.weight,
    value: item.value,
    hsCode: item.hsCode,
    originCountry: item.originCountry,
  }));
}

function getEarlierDate(d1, d2) {
  return d1 !== null && d1 < d2 ? d1 : d2;
}

function getLaterDate(d1, d2) {
  return d1 !== null && d1 > d2 ? d1 : d2;
}
