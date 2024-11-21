import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import axios from 'axios';
import crypto from 'crypto';
import { TransporterException } from '@/app/exception/transporter-exception';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import moment from 'moment';
import _ from 'lodash';
import { GeodisOption } from '@/domain/sci/transporter/broker/geodis/geodis.option';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import { CreatePickupResponse } from '@/domain/ord/parcel/dto/response/create-pickup-response';

export class GeodisBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const timestamp = Date.now().toString();
    const language = 'fr';
    const service = 'api/wsclient/enregistrement-envois';
    const data = this.buildData(shipment, channelConfig);
    const hash = this.encodeData(channelConfig.accountInfo, timestamp, language, service, data);
    let response;
    try {
      response = await axios.request({
        url: `${channelConfig.shipmentUrl}${service}`,
        method: 'post',
        headers: {
          'X-GEODIS-Service': `${channelConfig.accountInfo.id};${timestamp};fr;${hash}`,
        },
        data,
        timeout: 10000
      });
    } catch (e) {
      throw new TransporterException('Geodis', e.message, data);
    }

    const shipmentResult = response.data.contenu.listRetoursEnvois[0];
    const docEtiquette = shipmentResult.docEtiquette;
    const docBordereau = shipmentResult.docBordereau;
    if (!docEtiquette || !docBordereau) {
      // 获取报错信息
      throw new TransporterException('Geodis', shipmentResult.msgErreurEnregistrement.texte, data);
    }

    return {
      trackingNumber: shipmentResult.noSuivi,
      shippingNumber: shipmentResult.noRecepisse,
      label: docEtiquette.contenu,
      labelFormat: docEtiquette.type,
      manifestLabel: docBordereau.contenu,
      manifestLabelFormat: docBordereau.type,
      transporterRequest: JSON.stringify(data),
      transporterResponse: JSON.stringify(response.data),
      pallets: shipmentResult.listRetoursUM.map(item => {
        return {
          reference: item.referenceUM,
          palletNumber: item.cabGeodisUM,
        };
      }),
    };
  }

  /**
   * https://espace-client.geodis.com/docapi/en/#operation/rechercheNosSuivisUsingPOST
   *
   * @param shipment
   * @param channelConfig
   * @private
   */
  private buildData(shipment: CreateClientDto, channelConfig) {
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const parcels = shipment.parcels || [shipment.parcel];
    const options = <GeodisOption>shipment.options;
    return {
      modificationParReference1: false,
      impressionEtiquette: true,
      typeImpressionEtiquette: channelConfig.labelFormat.value,
      formatEtiquette: '1',
      validationEnvoi: true,
      suppressionSiEchecValidation: false,
      impressionBordereau: true,
      impressionRecapitulatif: false,
      listEnvois: [
        {
          // noRecepisse: '',
          // noSuivi: '',
          horsSite: false,
          codeSa: channelConfig.accountInfo.agency,
          codeClient: channelConfig.accountInfo.account,
          codeProduit: channelConfig.productCode,
          reference1: parcels[0].reference,
          // reference2: 'ref-2',
          expediteur: {
            nom: TransporterUtils.getFullName(senderAddress),
            adresse1: senderAddress.street1 || '',
            adresse2: `${senderAddress.street2 || ''} ${senderAddress.street3 || ''}`,
            codePostal: senderAddress.postalCode,
            ville: senderAddress.city,
            codePays: senderAddress.countryCode,
            nomContact: TransporterUtils.getFullName(senderAddress),
            email: senderAddress.email,
            telFixe: senderAddress.phoneNumber,
            // indTelMobile: '',
            telMobile: senderAddress.mobileNumber,
            // codePorte: '',
          },
          dateDepartEnlevement: moment(shipment.shippingDate).format('YYYY-MM-DD'),
          instructionEnlevement: 'Entree fournisseurs',
          destinataire: {
            nom: TransporterUtils.getFullName(receiverAddress),
            adresse1: receiverAddress.street1 || '',
            adresse2: `${receiverAddress.street2 || ''} ${receiverAddress.street3 || ''}`,
            codePostal: receiverAddress.postalCode,
            ville: receiverAddress.city,
            codePays: receiverAddress.countryCode,
            nomContact: options.contactName,
            email: receiverAddress.email,
            telFixe: receiverAddress.phoneNumber,
            // indTelMobile: '33',
            telMobile: receiverAddress.mobileNumber,
            // codePorte: '1515',
          },
          listUmgs: parcels.map(parcel => {
            return {
              //TODO parcel.option.isPallet
              palette: true,
              // paletteConsignee: true,
              quantite: 1,
              poids: parcel.weight,
              volume: parcel.length * parcel.width * parcel.height,
              // 单位cm整数
              longueurUnitaire: parcel.length,
              largeurUnitaire: parcel.width,
              hauteurUnitaire: parcel.height,
              referenceColis: parcel.reference,
            };
          }),
          poidsTotal: _.sumBy(parcels, 'weight'),
          // 单位m
          volumeTotal: _.sumBy(parcels, parcel => parcel.length * parcel.width * parcel.height) / 1000,
          codeIncotermConditionLivraison: 'P',
          codeSaBureauRestant: '',
          optionLivraison: options.deliveryOption,
          // 备注
          instructionLivraison: '',
          // contreRemboursement: {
          //   quantite: 12.34,
          //   codeUnite: 'EUR',
          // },
          emailNotificationDestinataire: options.contactEmail,
          smsNotificationDestinataire: options.contactMobileNumber,
        },
      ],
    };
  }

  private encodeData(accountInfo, timestamp, language, service, data) {
    const str = [accountInfo.apiKey, accountInfo.id, timestamp, language, service, JSON.stringify(data)].join(';');
    return crypto
      .createHash('sha256')
      .update(str)
      .digest('hex');
  }

  async schedulePickup(pickUp: CreatePickupDto, channelConfig: BaseConfig): Promise<CreatePickupResponse> {
    const data = {
      impressionRecapitulatif: true,
      listEnlevements: [
        {
          expediteur: {
            nom: TransporterUtils.getFullName(pickUp.senderAddress),
            adresse1: pickUp.senderAddress.street1,
            adresse2: pickUp.senderAddress.street1,
            codePostal: pickUp.senderAddress.postalCode,
            ville: pickUp.senderAddress.city,
            codePays: pickUp.senderAddress.countryCode,
          },
          codeSa: channelConfig.accountInfo.agency, // 仓库代码
          codeClient: channelConfig.accountInfo.account, // 客户账号
          listCodesProduit: [channelConfig.productCode], // listCodes产品
          dateEnlevement: pickUp.pickupAt,
          nbColis: pickUp.quantity,
          nbPalettes: pickUp.trayQuantity, // 托盘数量
          poidsTotal: pickUp.totalWeight, //总重量
        },
      ],
    };

    const timestamp = Date.now().toString();
    const language = 'fr';
    const service = 'api/wsclient/enregistrement-validation-enlevements';
    const hash = this.encodeData(channelConfig.accountInfo, timestamp, language, service, data);
    let response: any;
    try {
      response = await axios.request({
        url: `${channelConfig.shipmentUrl}${service}`,
        method: 'post',
        headers: {
          'X-GEODIS-Service': `${channelConfig.accountInfo.id};${timestamp};fr;${hash}`,
        },
        data,
      });
    } catch (e) {
      throw new TransporterException('Geodis', e.message);
    }
    const shipmentResult = response.data.contenu.listRetoursEnlevements;
    const noRecepisse = shipmentResult[0].noRecepisse;
    if (!noRecepisse) {
      throw new TransporterException('Geodis', shipmentResult[0].msgErreurEnregistrementValidation.texte);
    }

    return {
      PRN: noRecepisse,
      transporterRequest:JSON.stringify(data),
      transporterResponse:JSON.stringify(response.data),
      returnResult: shipmentResult
    }

  }

  async cancelPickup(dto, config: BaseConfig) {
    const data = {
      listNosRecepisses: [dto.pickupRequestNumber],
    };
    const timestamp = Date.now().toString();
    const language = 'fr';
    const service = 'api/wsclient/annulation-enlevements';
    const hash = this.encodeData(config.accountInfo, timestamp, language, service, data);
    let response: any;
    try {
      response = await axios.request({
        url: `${config.shipmentUrl}${service}`,
        method: 'post',
        headers: {
          'X-GEODIS-Service': `${config.accountInfo.id};${timestamp};fr;${hash}`,
        },
        data,
      });
    } catch (e) {
      throw new TransporterException('Geodis', e.message);
    }
    const shipmentResult = response.data.contenu.listRetoursEnlevements;
    const noRecepisse = shipmentResult[0].noRecepisse;
    if (!noRecepisse) {
      throw new TransporterException('Geodis', shipmentResult[0].msgErreurEnregistrementValidation.texte);
    }
    return shipmentResult;
  }
}
