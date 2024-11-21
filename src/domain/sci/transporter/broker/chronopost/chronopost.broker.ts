import { CancelParcelDto, CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import _ from 'lodash';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import { Injectable } from '@nestjs/common';
import { GeneratorInvoicePdf } from '@/domain/sci/transporter/broker/common/generate-invoice-pdf';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { classToPlain } from 'class-transformer';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { Logger } from '@/app/logger';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import moment from 'moment';
import Axios, { AxiosRequestConfig } from 'axios';
import { XmlParser } from '@/domain/sci/transporter/broker/common/xml-parser';
import { CreatePickupResponse } from '@/domain/ord/parcel/dto/response/create-pickup-response';

@Injectable()
export class ChronopostBroker extends TransporterBroker {
  pdfUtil = new PdfUtil();

  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { senderAddress, receiverAddress, parcel, shippingDate } = shipment;
    const { accountInfo } = channelConfig;

    const cnpOption: any = classToPlain(shipment.options) || {};

    //海外省改变countryCode
    if (['MF', 'BL', 'SM'].includes(receiverAddress.countryCode)) {
      receiverAddress.countryCode = 'GP';
    }

    const data = {
      headerValue: {
        accountNumber: accountInfo.accountNumber,
        idEmit: 'CHRFR', //Valeur fixe : CHRFR
        identWebPro: '',
        subAccount: '',
      },
      shipperValue: {
        shipperAdress1: senderAddress.street1,
        shipperAdress2: `${senderAddress.street2 || ''} ${senderAddress.street3 || ''}`,
        shipperCity: senderAddress.city,
        shipperCivility: 'M',
        shipperContactName: TransporterUtils.getFullName(senderAddress),
        shipperCountry: senderAddress.countryCode,
        shipperCountryName: 'FRANCE',
        shipperEmail: senderAddress.email,
        shipperName: senderAddress.company || TransporterUtils.getFullName(senderAddress),
        shipperName2: TransporterUtils.getFullName(senderAddress),
        shipperZipCode: senderAddress.postalCode,
        shipperPhone: senderAddress.phoneNumber,
        shipperMobilePhone: senderAddress.mobileNumber,
        shipperPreAlert: 0, //[0,1] Type de préalerte ( MAS)
      },
      customerValue: {
        customerName: 'WINE PROJECT',
        customerName2: '',
        customerCivility: 'M', //['E','L','M'],E (Madame), L (Mademoiselle), M(Monsieur)
        customerContactName: 'Jean Voie le Colis',
        customerAdress1: 'ADRESSE 1 EXPED',
        customerAdress2: 'ADRESSE 1 EXPED',
        customerZipCode: '75010',
        customerCity: 'PARIS',
        customerCountry: 'FR',
        customerCountryName: 'FRANCE',
        customerPhone: '',
        customerMobilePhone: '0102030405',
        customerEmail: 'jean.voielecolis@fai.fr',
        customerPreAlert: 0,
        printAsSender: 'N',
      },
      recipientValue: {
        recipientName: receiverAddress.company || TransporterUtils.getFullName(receiverAddress), //Raison sociale du destinataire
        recipientName2: TransporterUtils.getFullName(receiverAddress), //Raison sociale2 du destinataire
        recipientCivility: 'M',
        recipientContactName: TransporterUtils.getFullName(receiverAddress), //Nom contact du destinataire
        recipientAdress1: receiverAddress.street1,
        recipientAdress2: `${receiverAddress.street2 || ''} ${receiverAddress.street3 || ''}`,
        recipientZipCode: receiverAddress.postalCode,
        recipientCity: receiverAddress.city,
        recipientCountry: receiverAddress.countryCode,
        // recipientCountryName: receiverAddress.countryCode,
        recipientPhone: receiverAddress.phoneNumber || receiverAddress.mobileNumber,
        recipientMobilePhone: receiverAddress.mobileNumber,
        recipientEmail: receiverAddress.email,
        recipientPreAlert: 0,
      },
      refValue: {
        customerSkybillNumber: '',
        PCardTransactionNumber: '',
        recipientRef: parcel.instructions,
        shipperRef: parcel.reference,
      },
      skybillValue: {
        bulkNumber: 1,
        codCurrency: 'EUR',
        codValue: '',
        content1: '',
        content2: '',
        content3: '',
        content4: '',
        content5: '',
        customsCurrency: 'EUR',
        customsValue: '', //清关国家必填
        evtCode: 'DC', //Code événement de suivi Chronopost fix DC
        insuredCurrency: 'EUR',
        // TODO xiewenzhen 请注意这里的保险金额, 传递给派送商需要 *100 比如10欧=传递值1000,保险金额通过options传递, 给每一个包裹投保, 每个包裹都可以投保
        insuredValue: MathCalculator.mul(shipment.parcel.insuranceValue, 100),
        objectType: shipment.options?.packingType ? shipment.options.packingType : 'DOC', //Type de colis ,DOC : Document MAR : Marchandise
        portCurrency: 'EUR',
        // portValue: '',
        productCode: channelConfig.productCode,

        // !!!xiewenzhen 0: 代表没有周六送达, 6: 代表可以周六送达
        service: cnpOption.isDeliverSat ? 6 : 0, //[0,6] 0:pas de livraison samedi
        shipDate: shippingDate,
        shipHour: 16, //Heure d'expédition
        skybillRank: 1,
        weight: parcel.weight,
        weightUnit: 'KGM',
      },
      skybillParamsValue: {
        mode: channelConfig.labelFormat.value,
        duplicata: 'N',
        withReservation: '2',
      },
      password: accountInfo.password,
      // version: '2.0',
      modeRetour: '2',
      numberOfParcel: '1',
      multiParcel: 'N',
    };

    // 增加as字段，但是不填值（根据派送商反馈）
    if (_.includes(_.keysIn(cnpOption), 'as')) {
      data.skybillValue['as'] = '';
    }
    //子账号
    if (accountInfo.subAccount) {
      data.headerValue.subAccount = accountInfo.subAccount;
    }

    if (parcel.items && parcel.items.length > 0) {
      const { totalAmount, contents } = formatItems(parcel.items);
      contents.map((content, index) => {
        data.skybillValue[`content${index + 1}`] = content;
      });
      data.skybillValue.customsValue = totalAmount.toString();
    }

    let path = '/src/assets/wsdl/chronopost/ShippingServiceWS.wsdl';
    let shippingMethod = 'shippingMultiParcelAsync';
    if (shipment.options?.isPaperLess) {
      path = '/src/assets/wsdl/chronopost/ShippingServiceWSV3.wsdl';
      shippingMethod = 'shippingMultiParcelV3Async';
    }
    const labelConfig = {
      wsdl: `${process.cwd()}${path}`,
      url: channelConfig.shipmentUrl,
      timeout: 7000,
    };
    const client: any = await new Soap().createClient(labelConfig, null);

    let responses: any;
    try {
      responses = await client[shippingMethod](data);
    } catch (e) {
      throw new TransporterException('Chronopost', e.message, client.lastRequest);
    }

    const { errorCode = null, errorMessage = null } = responses[0].return;
    if (errorCode) {
      if (errorCode === 38) {
        throw new TransporterException(
          'Chronopost',
          'Erreur dans la cohérence Pays Expe, CP expe, Pays Dest, CP dest ou CP dest interdit.',
          client.lastRequest,
        );
      }
      throw new TransporterException('Chronopost', errorMessage, client.lastRequest);
    }
    const {
      pdfEtiquette,
      skybillNumber,
      geoPostCodeBarre: barCode,
      geoPostNumeroColis,
    } = responses[0].return.resultMultiParcelValue[0];

    let scaledPdf = undefined;
    if (channelConfig.labelFormat.code === 'A6_PDF') {
      scaledPdf = await new PdfUtil().convertA4ToA6(pdfEtiquette);
    }

    const result: CreateParcelResponse = {
      trackingNumber: skybillNumber,
      shippingNumber: geoPostNumeroColis,
      label: scaledPdf || pdfEtiquette,
      labelFormat: channelConfig.labelFormat.labelType,
      cn23: '',
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
      instructions: parcel.instructions,
      barCode,
    };

    if (shipment.parcel && shipment.parcel.items && shipment.parcel.items.length > 0) {
      shipment['trackingNumber'] = skybillNumber;
      result.invoice = GeneratorInvoicePdf.generator(shipment, channelConfig);
    }

    result.label = await this.pdfUtil.drawLogoOnLabel(
      result.label,
      channelConfig.platform,
      channelConfig.transporterId,
      channelConfig.labelFormat.code,
      cnpOption.enableCustomLogo,
    );
    return result;
  }

  async fetchTrackingOfficial({ trackingNumberArray, language = 'en' }) {
    const trackingArray = [];
    const lan = (() => {
      switch (language) {
        case 'fr':
          return 'fr_FR';
        case 'en':
          return 'en_GB';
      }
    })();
    const traceConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/chronopost/TrackingServiceWS.wsdl`,
      url: 'https://ws.chronopost.fr/tracking-cxf/TrackingServiceWS',
    };
    const client: any = await new Soap().createClient(traceConfig);
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 100)) {
      const chunkTrackingArray = [];
      const promises = chunkTrackingNumberArray.map(async trackingNumber => {
        const data = {
          language: lan,
          skybillNumber: trackingNumber,
        };
        try {
          const responses = await client['trackSkybillV2Async'](data);
          //TODO keminfeng Cannot read property 'events' of undefined
          const events = responses[0].return.listEventInfoComp.events;
          if (!events) {
            // 则表示该包裹已被废弃, 包裹就没有跟踪信息. 表明已被废弃, 不在维护了.
            chunkTrackingArray.push(...[]);
          }
          chunkTrackingArray.push(...events.map(event => toTracking(event, trackingNumber)));
        } catch (error) {
          Logger.error(error.message);
          chunkTrackingArray.push(...[]);
        }
      });
      await Promise.all(promises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }

  private buildPickupData(shipment: CreatePickupDto, channelConfig: BaseConfig) {
    const { senderAddress, pickupAt, totalWeight, quantity, options } = shipment;
    const { accountInfo } = channelConfig;
    // 截至取货时间定为 当天17:00:00
    const pickupEndAt = moment(pickupAt)
      .hour(17)
      .minute(0)
      .second(0)
      .format();

    const data = {
      esdValue: {
        retrievalDateTime: pickupAt, // 期望取件时间
        closingDateTime: options?.closingDateTime || pickupEndAt, // 截至取件时间
        refEsdClient: `ref${Date.now()}`, // 唯一取件编号
        numberOfParcel: quantity, // 包裹数量
      },
      headerValue: {
        accountNumber: accountInfo.accountNumber,
        idEmit: 'CHRFR',
      },
      shipperValue: {
        shipperAdress1: senderAddress.street1,
        shipperAdress2: `${senderAddress.street2 || ''} ${senderAddress.street3 || ''}`,
        shipperCity: senderAddress.city,
        shipperCivility: 'M',
        shipperContactName: TransporterUtils.getFullName(senderAddress),
        shipperCountry: senderAddress.countryCode,
        shipperCountryName: 'FRANCE',
        shipperEmail: senderAddress.email,
        shipperName: senderAddress.company || TransporterUtils.getFullName(senderAddress),
        shipperName2: TransporterUtils.getFullName(senderAddress),
        shipperZipCode: senderAddress.postalCode,
        shipperPhone: senderAddress.phoneNumber,
        shipperMobilePhone: senderAddress.mobileNumber,
        shipperPreAlert: 0,
      },
      customerValue: {
        customerName: 'WINE PROJECT',
        customerName2: '',
        customerCivility: 'M',
        customerContactName: 'Jean Voie le Colis',
        customerAdress1: 'ADRESSE 1 EXPED',
        customerAdress2: 'ADRESSE 1 EXPED',
        customerZipCode: '75010',
        customerCity: 'PARIS',
        customerCountry: 'FR',
        customerCountryName: 'FRANCE',
        customerPhone: '',
        customerMobilePhone: '0102030405',
        customerEmail: 'jean.voielecolis@fai.fr',
        customerPreAlert: 0,
        printAsSender: 'N',
      },
      skybillValue: {
        NumberOfParcel: quantity,
        weight: totalWeight,
        weightUnit: 'KGM',
      },
      password: accountInfo.password,
      version: '2.0', // 此字段必须保留！！！没有该字段就不会返回ESDFullNumber
    };

    return data;
  }

  /**
   * 下取件订单
   * @param shipment
   * @param channelConfig
   */
  async schedulePickup(shipment: CreatePickupDto, channelConfig: BaseConfig): Promise<CreatePickupResponse> {
    const data = this.buildPickupData(shipment, channelConfig);

    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/chronopost/ShippingServiceWS.wsdl`,
      url: channelConfig.shipmentUrl,
      timeout: 7000,
    };
    const client: any = await new Soap().createClient(labelConfig, null);

    try {
      const [response] = await client['shippingWithESDOnlyAsync'](data);
      // 下单成功返回取件单号
      if (response.return.errorCode == 0) {
        return {
          PRN: response.return.ESDFullNumber,
          transporterRequest: JSON.stringify(data),
          transporterResponse: response,
          returnResult: {
            PRN: response.return.ESDFullNumber,
          },
        };
      } else {
        throw new Error(response.return.errorMessage);
      }
    } catch (e) {
      throw new TransporterException('Chronopost', e.message, client.lastRequest);
    }
  }

  /**
   * 取消取件
   * @param dto
   * @param config
   */
  async cancelPickup(dto, config) {
    const { accountNumber, password } = config.accountInfo;
    const data = {
      accountNumber,
      password,
      esdNumber: dto.pickupRequestNumber,
    };

    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/chronopost/ShippingServiceWS.wsdl`,
      url: config.shipmentUrl,
      timeout: 7000,
    };
    const client: any = await new Soap().createClient(labelConfig, null);

    try {
      const [response] = await client['annulerEnlevementsAsync'](data);

      const res = response.return.statut.entry[0];
      const message = res.value['$value'];
      // 取消成功
      if (message === 'ESD canceled') {
        return `${res.key['$value']},${message}`;
      } else {
        throw new Error(message);
      }
    } catch (e) {
      throw new TransporterException('Chronopost', e.message, client.lastRequest);
    }
  }

  /**
   * 包裹取消
   * @param cancelParcel CancelParcelDto
   * @param channelConfig BaseConfig
   */
  async cancelShipment(cancelParcel: CancelParcelDto, channelConfig: BaseConfig) {
    const { accountNumber, password } = channelConfig.accountInfo;
    const data = {
      accountNumber,
      password,
      skybillNumber: cancelParcel.shippingNumber,
      language: 'fr_FR',
    };
    const requestConfig: AxiosRequestConfig = {
      url: `https://ws.chronopost.fr/tracking-cxf/TrackingServiceWS/cancelSkybill`,
      method: 'get',
      params: data,
    };
    let response: any;
    try {
      response = await Axios.request(requestConfig);
      const resultObject: any = new XmlParser().parseXmlString2Obj(response.data);
      const result: any = resultObject['soap:Envelope']['soap:Body']['ns2:cancelSkybillResponse']['return'];
      if (Number(result?.errorCode) !== 0) {
        throw new TransporterException('Chronopost', result?.errorMessage);
      }
    } catch (e) {
      throw new TransporterException('Chronopost', e?.message);
    }
    return 'cancel ok';
  }
}

function formatItems(items) {
  const contents = items.map(item => item.description);
  const totalAmount = MathCalculator.sumBy(items, item => MathCalculator.mul(item.value, item.quantity));
  return { totalAmount, contents };
}

function toTracking(event, trackingNumber) {
  const { code, eventLabel, eventDate, officeLabel } = event;
  return {
    timestamp: eventDate,
    event: code,
    description: eventLabel,
    location: officeLabel,
    trackingNumber,
  };
}
