import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import moment from 'moment';
import 'moment-timezone';
import i18n from '@/assets/i18n';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CorreosOption } from '@/domain/sci/transporter/broker/correos/correos.option';
import axios from 'axios';
import { TransporterException } from '@/app/exception/transporter-exception';
import { MathCalculator } from '@/domain/sci/transporter/broker/common/math-calculator';
import { Logger } from '@/app/logger';

//TODO: 西邮的电话是否只接受9位
@Injectable()
export class CorreosBroker extends TransporterBroker {
  constructor() {
    super();
  }
  // 'S0410 - EU'
  // 'S0132 - 本土'

  // 1. 收发件人国家都是ES 则使用CP, 反之使用ZIP. 这个逻辑对吗?
  // 2. 如果不过收发件人, 只管四位邮编, 如果是四位邮编, 就使用ZIP 这个逻辑对吗?
  // 3. 西邮有多少个平台在使用? 答: OMS和速运都在使用
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const corOption: any = <CorreosOption>shipment.options || {};
    const data = this._buildData(shipment, channelConfig);

    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/correos/Label.wsdl`,
      url: channelConfig.shipmentUrl,
      auth: {
        username: '{{username}}',
        password: '{{password}}',
      },
      overrideRootElement: {
        namespace: 'xsd',
      },
      timeout: 10000
    };
    const client: any = await new Soap().createClient(labelConfig, channelConfig.accountInfo);
    let responses: any;
    try {
      responses = await client['PreRegistroAsync'](data);
    } catch (e) {
      throw new TransporterException('CORREOS', e.body, client.lastResponse);
    }

    const response = responses[0];
    if (response['BultoError']) {
      const i18nElement = i18n['cn'];
      const message = i18nElement._t(
        `CORREOS_ERROR_${response.BultoError.Error}`,
        `CORREOS_ERROR_${response.BultoError.DescError}`,
      );
      throw new TransporterException('CORREOS', message, client.lastResponse);
    }

    const shippingNumber = response.CodExpedicion;
    const trackingNumber = response.Bulto.CodEnvio;
    const label = response.Bulto.Etiqueta.Etiqueta_pdf.Fichero;
    const cn23 = corOption.needCN23 ? await this._fetchCN23(client, trackingNumber) : null;
    return {
      shippingNumber,
      trackingNumber,
      label,
      labelFormat: 'pdf',
      transporterResponse: client.lastResponse,
      transporterRequest: client.lastRequest,
      cn23,
    };
  }

  async _fetchCN23(soapClient, trackingNumber) {
    const data = {
      codCertificado: trackingNumber,
    };
    const response = await soapClient['DocumentacionAduaneraCN23CP71OpAsync'](data);
    if (response[0].Resultado === 0) {
      return response[0].Fichero;
    } else {
      // throw new BusinessException(`Correos fetch CN23 Error: ${response[0].MotivoError}`);
      return null;
    }
  }

  async fetchTrackingOfficial({ trackingNumberArray }): Promise<any[]> {
    const trackingArray = [];
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 50)) {
      const chunkTrackingArray = [];
      const promises = chunkTrackingNumberArray.map(async trackingNumber => {
        // 需要修改对应的事件
        const data = (
          await axios.request({
            url: `https://localizador.correos.es/canonico/eventos_envio_servicio_auth/${trackingNumber}`,
            method: 'get',
            responseType: 'json',
            auth: {
              username: 'w1002631',
              password: 'OykTmypF',
            },
            params: {
              codIdioma: 'EN',
              indUltEvento: 'N',
            },
          })
        ).data[0];
        const {
          eventos: rawTracking = [],
          error: { codError: code, desError: message },
        } = data;
        if (code === '3') {
          // throw new TransporterException('Correos', message);
          Logger.error(message);
        } else {
          const tracking = rawTracking.map(tracking => {
            return {
              trackingNumber: trackingNumber,
              location: tracking.localidad,
              timestamp: moment
                .tz(`${tracking.fecEvento} ${tracking.horEvento}`, 'DD/MM/YYYY hh:mm:ss', 'Europe/Paris')
                .toDate(),
              event: tracking.codEvento,
              description: tracking.desTextoAmpliado,
            };
          });
          chunkTrackingArray.push(...tracking);
        }
      });
      await Promise.all(promises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }

  async fetchTrackingUnofficial({ trackingNumberArray }) {
    // 备用接口 https://api1.correos.es/digital-services/searchengines/api/v1/?text=PK6SE50710000030141720N&language=CH&searchType=envio
    console.log(trackingNumberArray);
    return [];
  }

  private _buildData(shipment: CreateClientDto, channelConfig: BaseConfig) {
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const parcel = shipment.parcel;
    const accountInfo = channelConfig.accountInfo;
    const corOption: any = <CorreosOption>shipment.options || {};
    let Aduana = {};
    if (!_.isEmpty(parcel.items)) {
      Aduana = {
        TipoEnvio: corOption.tipoEnvio || '3',
        // EnvioComercial: (corOption.tipoEnvio || '3').toString() === '4' ? 'Y' : null,
        // FacturaSuperiora500: 'N',
        // DUAConCorreos: 'N',
        DescAduanera: {
          DATOSADUANA: _.map(parcel.items, item => ({
            Cantidad: item.quantity || '',
            Descripcion: item.description || '',
            Pesoneto: MathCalculator.mul(item.weight, 1000) || '',
            Valorneto: `000000${_.round(MathCalculator.mul(item.value, 100), 0)}`.substr(-6) || '',
            PaisOrigen: item.originCountry,
          })),
        },
      };
    }

    const senderName = this.getFullName(senderAddress.firstName, senderAddress.lastName);
    const receiverName = this.getFullName(receiverAddress.firstName, receiverAddress.lastName);
    const data: any = {
      FechaOperacion: moment(shipment.shippingDate).format('DD-MM-YYYY hh:mm:ss'),
      CodEtiquetador: accountInfo.labeler,
      Care: '000000',
      TotalBultos: 1,
      // labelFormat
      ModDevEtiqueta: '2',
      Remitente: {
        Identificacion: {
          Nombre: senderName,
          Empresa: senderAddress.company,
          Nif: corOption.nif,
        },
        DatosDireccion: {
          Direccion: TransporterUtils.streetsToString(senderAddress),
          Localidad: senderAddress.city,
          Provincia: senderAddress.province,
        },
        CP: senderAddress.postalCode,
        Telefonocontacto: senderAddress.mobileNumber || senderAddress.phoneNumber,
        Email: senderAddress.email,
      },
      Destinatario: {
        Identificacion: {
          Nombre: receiverName,
          Empresa: receiverAddress.company,
        },
        DatosDireccion: {
          Direccion: TransporterUtils.streetsToString(receiverAddress),
          Localidad: receiverAddress.city,
          Provincia: receiverAddress.province,
        },
        // TODO xiewenzhen 如果是4位数的邮编, 使用ZIP去传递 ? 还是欧洲的邮编使用ZIP传递, 西邮本土使用CP传递?
        // !!! 邮编: 西邮本土使用CP, 欧洲线使用ZIP
        // CP: receiverAddress.postalCode.length <= 5 ? receiverAddress.postalCode : null,
        // ZIP: receiverAddress.postalCode,
        Pais: receiverAddress.countryCode,
        Telefonocontacto: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
        Email: receiverAddress.email,
      },
      Envio: {
        CodProducto: channelConfig.productCode || 'S0132',
        ReferenciaCliente: parcel.reference,
        TipoFranqueo: 'FP',
        ModalidadEntrega: 'ST',
        Pesos: {
          // Peso数组
          Peso: {
            TipoPeso: 'R',
            Valor: MathCalculator.mul(parcel.weight, 1000),
          },
        },
        // 保险
        // ValoresAnadidos:{},
        InstruccionesDevolucion: 'D',
        // Compulsory data if the shipment comes from the Spanish mainland/Balearic Islands and the destination is the Canary Islands, Ceuta or Melilla. Also for shipments that come from the Canary Islands, Ceuta or Melilla and go outside their territory. Also for international shipments.
        // 如果货件来自西班牙大陆/巴利阿里群岛并且目的地是加那利群岛、休达或梅利利亚，则必须提供数据。 也适用于来自加那利群岛、休达或梅利利亚并运往其领土以外的货件。 也适用于国际运输。
        Aduana: Aduana,
        Largo: parcel.length, // Length of the shipment in centimetres
        Alto: parcel.height, //Height of the shipment in centimetres
        Ancho: parcel.width, // Width of the shipment in centimetres
      },
    };
    if ('ES' === senderAddress.countryCode && 'ES' === receiverAddress.countryCode) {
      // 法国本土, 使用CP
      data.Destinatario.CP = receiverAddress.postalCode;
    } else {
      data.Destinatario.ZIP = receiverAddress.postalCode;
    }
    return data;
  }

  private getFullName(firstName, lastName): string {
    if (!firstName && !lastName) {
      return '';
    }
    return `${firstName ? firstName + ' ' : ''}${lastName || ''}`;
  }
}
