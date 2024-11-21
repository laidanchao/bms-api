import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import axios, { AxiosRequestConfig } from 'axios';
import { plainToClass } from 'class-transformer';
import { DelivengoOption } from '@/domain/sci/transporter/broker/delivengo/delivengo.option';
import _ from 'lodash';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { LaposteTracking } from '@/domain/sci/transporter/broker/common/laposte-tracking';
import { Transporter } from '@/domain/utils/Enums';

// !!! 如果要寄送到中国, 必须加上 envoi_nature.
export class DelivengoBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const productCode = channelConfig.productCode;
    const accountInfo = channelConfig.accountInfo;
    const shipmentUrl = channelConfig.shipmentUrl;
    const labelFormat = channelConfig.labelFormat;
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const parcel = shipment.parcel;

    const shipmentOptions: any = plainToClass(DelivengoOption, shipment.options) || {};
    const parcels = [parcel];
    const plis = _.map(parcels, parcel => {
      const item: any = {
        expediteur: {
          raison_sociale: senderAddress.company, // Company name of the address.
          nom: `${senderAddress.firstName} ${senderAddress.lastName}`,
          complement_voie: `Phone:${senderAddress.mobileNumber || senderAddress.phoneNumber} ${senderAddress.street2} ${
            senderAddress.street3
          }`,
          voie: `${senderAddress.street1}`,
          code_postal_commune: `${senderAddress.postalCode} ${senderAddress.city}`,
        },
        destinataire: {
          raison_sociale: receiverAddress.company,
          nom: `${receiverAddress.firstName} ${receiverAddress.lastName}`,
          complement_voie: `Phone:${receiverAddress.mobileNumber || receiverAddress.phoneNumber} ${
            receiverAddress.street2
          } ${receiverAddress.street3}`,
          voie: `${receiverAddress.street1}`,
          code_postal_commune: `${receiverAddress.postalCode} ${receiverAddress.city}`,
          pays: receiverAddress.countryCode,
        },
        destinataire_email: receiverAddress.email,
        reference: parcel.reference,
        destinataire_telephone: receiverAddress.phoneNumber,
        options: shipmentOptions.notificationLevel || '',
        poids: MathCalculator.mul(parcel.weight, 1000), // 单位毫克 TODO xiewenzhen 单位是克gr? 还是 毫克?
        expediteur_telephone: senderAddress.phoneNumber,
        destination_telephone: receiverAddress.phoneNumber,
      };
      if (!_.isArray(shipmentOptions.customsCategory)) {
        shipmentOptions.customsCategory = [shipmentOptions.customsCategory];
      }
      if (!_.isEmpty(shipmentOptions.customsCategory)) {
        const articles = _.map(parcel.items, item => {
          return {
            description_detaillee: item.description,
            quantite: item.quantity,
            poids: item.weight,
            valeur: item.value,
            pays_origine: item.originCountry,
            num_tarifaire: item.hsCode,
          };
        });
        const documents_douaniers = {
          envoi_nature: shipmentOptions.customsCategory,
          envoi_commercial: shipmentOptions.customsCategory == 6 ? 1 : 0, // 商业派送? 1:true, 0:false
          // 'observation': 'OBservation',
          // 'num_licence': '123',
          // 'num_certificat': '321',
          // 'num_facture': '123',
          frais_port: shipmentOptions.deliveryFee, // 	Frais de port. 运输费 必填
          articles: articles,
        };
        item.documents_douaniers = documents_douaniers;
      }
      return item;
    });
    const body = {
      data: {
        // !!! xiewenzhen 37是经济线, 不提供跟踪服务, 33提供跟踪服务
        id_support: productCode || 37,
        plis: plis,
      },
    };

    /**
     Supports d'impression pour le Delivengo Prio :
     4 : Planche d'étiquettes (A4)
     32  : Étiquette 10x15 cm
     64 : Étiquette 10x15 cm ZPL 200dpi
     128 : Étiquette 10x15 cm ZPL 300dpi
     */
    const uri = `${shipmentUrl}/envois?support=${labelFormat.value || 32}&print_reference=1`;
    const axiosConfig: AxiosRequestConfig = {
      method: 'POST',
      url: uri,
      headers: {
        'API-Authorization': accountInfo.apiToken,
        Accept: labelFormat.labelType || 'application/pdf', //!!!application/zpl    返回zpl面单格式
        'Content-type': 'application/json',
      },
      data: JSON.stringify(body),
      timeout: 10000,
    };
    let response: any;
    try {
      ({ data: response } = await axios(axiosConfig));
    } catch (e) {
      throw new TransporterException(
        'Delivengo',
        `create ship failed. ${JSON.stringify(e.response.data.error)}`,
        axiosConfig,
      );
    }
    const data = response.data;
    const shippingNumber = data.id;
    const trackingNumber = data.plis[0].numero; // step2 这里trackingNumber, 未有响应使用的接口
    let labelFormatType = 'pdf';
    if (labelFormat.labelType.includes('pdf')) {
      labelFormatType = 'pdf';
    }
    if (labelFormat.labelType.includes('zpl')) {
      labelFormatType = 'zpl';
    }
    return {
      trackingNumber,
      shippingNumber,
      label: data.documents_supports,
      cn23: data.documents_douaniers || '',
      labelFormat: labelFormatType,
      transporterRequest: JSON.stringify(body),
      transporterResponse: JSON.stringify(response),
    };
  }

  async getTrackings(param: {
    trackingNumber?: string;
    language?: string;
    account?: any;
    webServiceUrl?: string;
  }): Promise<any[]> {
    // TODO 上线后有需要再开发. 有如下几点理由:
    //    1. http://assistance-mydelivengo.fr/api/documentation/objet-tracking/ 文档只说明获取tracking需要url和apiKey, 但为明确指出
    //    2. 因为信息不明确, 所以后续根据实际包裹情况,再看
    //    3. https://www.assistance-mydelivengo.fr/api/documentation/get-plisid_pli/?version=profil-2.3 文档中有返回tracking字段
    //        但是tracking值为null, 因为测试下单包裹并未真正产生轨迹, 所以返回null. 因此也许实际查看.
    //   pli.id = data.plis[0].id
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `https://mydelivengo.laposte.fr/api/v2.3/plis/${param.trackingNumber}`,
      headers: {
        'API-Authorization': 'Eos3ohj1Koquae5cahx0iu0Daengeezi',
      },
    };
    try {
      const { data: response } = await axios(config);
      return response.data.tracking;
    } catch (e) {
      throw new TransporterException('Delivengo', `get Tracking failed. ${e.message}`);
    }
  }

  async fetchTrackingUnofficial({ trackingNumberArray }): Promise<any[]> {
    const laposteTracking = new LaposteTracking();
    const { trackingArray } = await laposteTracking.fetchTrackingFromWebSite(
      trackingNumberArray,
      Transporter.DELIVENGO,
    );
    return trackingArray;
  }
}
