import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import 'moment-timezone';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { GlsEsOption } from '@/domain/sci/transporter/broker/gls-es/gls-es.option';
import { TransporterException } from '@/app/exception/transporter-exception';

// 西班牙的GLS
@Injectable()
export class GlsEsBroker extends TransporterBroker {
  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const { accountInfo: account, labelFormat, productCode, shipmentUrl } = channelConfig;
    const { senderAddress, receiverAddress, parcel } = shipment;
    const data = {
      docIn: {
        Servicios: {
          attributes: {
            uidcliente: account.uidcliente,
          },
          Envio: {
            Fecha: formatShippingDate(shipment.shippingDate),
            Portes: 'P', //optional,Postage type (P=prepaid / D=cod), usually "P"
            // TODO xiewenzhen 一个产品下面对应一个timeFrame, 路线产品码, 既要code也要传timeFrame
            Servicio: productCode, //Service: 1=Courier, 37=Economy, 74=EuroBusinessParcel,看文档
            Horario: (<GlsEsOption>shipment.options).timeFrame, //Service's time frame:  3=BusinessParcel, 2=14:00Service, 18=EconomyParcel, 19=ParcelShop... Usual combinations of <Servicio>+<Horario>: 1+3=BusinessParcel, 1+2=14:00Service, 37+18=EconomyParcel, 74+void=EuroBusinessParcel, 1+19=ParcelShop
            Bultos: 1, //Number of packages of shipment
            Peso: parcel.weight, //Weigth, in kgs. Max 31.5 kgs in EuroBusinessParcel
            Remite: {
              //sender
              Nombre: TransporterUtils.getFullName(senderAddress), //sender name, up to 80 characters
              Direccion: TransporterUtils.streetsToString(senderAddress), // sender address, up to 80 characters
              Poblacion: senderAddress.city,
              Provincia: senderAddress.province, //optional
              Pais: senderAddress.countryCode, // always 34=Spain
              CP: senderAddress.postalCode, //sender zipcode, format 99999
              Telefono: senderAddress.phoneNumber, //[optional] format 999999999999999 [mandatory for EuroBusinessParcel, Servicio=74/76, because it is possible to send a sms. Optional for all other]. Include '00' constant + country code (34 for Spain, 33 for France, etc.) + phone number (only digits)
              Movil: senderAddress.mobileNumber, //同上
              Email: senderAddress.email,
            },
            Destinatario: {
              //收件人
              // Codigo:'', //[mandatory when <Horario>=19, optional for all other] ParcelShop point code
              Nombre: TransporterUtils.getFullName(receiverAddress),
              Direccion: TransporterUtils.streetsToString(receiverAddress),
              Poblacion: receiverAddress.city,
              Provincia: receiverAddress.province, //optional
              Pais: receiverAddress.countryCode, //Delivery country. 34=Spain, 351=Portugal,
              CP: receiverAddress.postalCode,
              Telefono: receiverAddress.phoneNumber,
              Movil: receiverAddress.mobileNumber,
              Email: receiverAddress.email, //mandatory for EuroBusinessParcel
              ATT: receiverAddress.company, // delivery Contact (useful when delivery name is a business)
            },
            Referencias: {
              Referencia: {
                attributes: {
                  tipo: 'C',
                },
                $value: parcel.reference, //Unique shipment/order reference,
              },
            },
          },
        },
      },
    };
    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/gls/GlsEs.wsdl`,
      url: shipmentUrl,
      timeout: 10000
    };
    const client: any = await new Soap().createClient(labelConfig, account);
    let responses: any;
    try {
      responses = await client['GrabaServiciosAsync'](data);
    } catch (e) {
      throw new TransporterException('GLS_ES', e, client.lastRequest);
    }
    const result = responses[0]['GrabaServiciosResult']['Servicios']['Envio']['Resultado']['attributes']['return'];
    // await saveSoapLog(this.app, client, 'COLISSIMO', '');

    //返回错误
    if (result !== '0') {
      const { Errores } = responses[0]['GrabaServiciosResult']['Servicios']['Envio'];
      throw new TransporterException(
        'GLS_ES',
        `error code:${result}, message:${(Errores && Errores.Error) || 'no message'}`,
        client.lastRequest,
      );
    }

    const trackingNumber = responses[0]['GrabaServiciosResult']['Servicios']['Envio']['attributes']['codbarras'];
    const shippingNumber = responses[0]['GrabaServiciosResult']['Servicios']['Envio']['attributes']['uid'];
    const label = await this.getLabel({ trackingNumber, labelFormat: labelFormat.value, labelConfig });
    return {
      trackingNumber,
      shippingNumber,
      label,
      labelFormat: labelFormat.labelType,
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
    };
  }

  /**
   *
   * @param trackingNumber {string}
   * @param labelFormat {string} -- [PDF,JPG,PNG,EPL,DPL,XML]
   * @param labelConfig
   * @return {Promise<void>}
   */
  async getLabel({ trackingNumber, labelFormat, labelConfig }) {
    const data = {
      codigo: trackingNumber,
      tipoEtiqueta: labelFormat.toUpperCase(),
    };
    const client: any = await new Soap().createClient(labelConfig);
    const response = await client['EtiquetaEnvioAsync'](data);
    if (response[0]) {
      return response[0]['EtiquetaEnvioResult']['base64Binary'][0];
    } else {
      throw new TransporterException('GLS_ES', '面单未能返回');
    }
  }

  /**
   *
   * @param shippingNumber
   * @return {Promise<{description: *, location: *, event: string, timestamp: Date}[]|*>}
   */
  /*
  async getTrackings({shippingNumber}) {
    const data = {
      uid: shippingNumber
    };
    const client:any = await new Soap().createClient(labelConfig);
    const response = await client['GetExpAsync'](data);
    const trackings = response[0]['GetExpResult']['expediciones']['exp']['tracking_list'];
    if (isArray(trackings)) {
      return response[0]['GetExpResult']['expediciones']['exp']['tracking_list'].map(toTracking);
    } else {
      return [toTracking(trackings.tracking)];
    }
  }

   */
}

function formatShippingDate(date) {
  return moment.tz(date, 'Europe/Paris').format('DD/MM/YY');
}

/**
 * 格式化跟踪信息
 * @param trackings
 */
// function toTracking(tracking) {
//   return {
//     timestamp: moment.tz(tracking.fecha, 'DD/MM/YYYY HHmmss', 'Europe/Paris').toDate(),
//     event: `SPAIN_GLS_${tracking.codigo}`,
//     description: tracking.evento,
//     location: tracking.nombreplaza,
//   };
// }
