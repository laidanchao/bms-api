import _ from 'lodash';
import { Soap } from '@/domain/sci/transporter/broker/common/soap';
import moment from 'moment';
import 'moment-timezone';
import { TransporterUtils } from '@/domain/sci/transporter/broker/common/transporter-policy';
import { CreateParcelResponse } from '@/domain/ord/parcel/dto';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';
import { DpdOption } from '@/domain/sci/transporter/broker/dpd/dpd.option';
import { Injectable } from '@nestjs/common';
import { GeneratorInvoicePdf } from '@/domain/sci/transporter/broker/common/generate-invoice-pdf';
import { TransporterException } from '@/app/exception/transporter-exception';
import { PdfUtil } from '@/domain/sci/transporter/broker/common/pdf-util';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';

@Injectable()
export class DpdBroker extends TransporterBroker {
  pdfUtil = new PdfUtil();

  async create(shipment: CreateClientDto, channelConfig: BaseConfig): Promise<CreateParcelResponse> {
    const dpdOption = <DpdOption>shipment.options || {};
    const { senderAddress, receiverAddress, parcel, shippingDate } = shipment;
    const { accountInfo, labelFormat } = channelConfig;
    //寄爱尔兰的包裹,邮编为1
    if (receiverAddress.countryCode === 'IE') {
      receiverAddress.postalCode = '1';
    }
    const data: any = {
      request: {
        receiveraddress: {
          countryPrefix: receiverAddress.countryCode,
          zipCode: receiverAddress.postalCode,
          city: receiverAddress.city,
          street: TransporterUtils.streetsToString(receiverAddress),
          name: TransporterUtils.getAddressName(receiverAddress),
          phoneNumber: receiverAddress.mobileNumber || receiverAddress.phoneNumber,
        },
        receiverinfo: {
          contact: TransporterUtils.getFullName(receiverAddress),
          vinfo1: receiverAddress.street2,
          vinfo2: receiverAddress.street3,
        },
        shipperaddress: {
          countryPrefix: senderAddress.countryCode,
          zipCode: senderAddress.postalCode,
          city: senderAddress.city,
          street: TransporterUtils.streetsToString(senderAddress),
          name: TransporterUtils.getAddressName(senderAddress),
          phoneNumber: senderAddress.mobileNumber || senderAddress.phoneNumber,
        },
        customer_countrycode: accountInfo.countryCode,
        customer_centernumber: accountInfo.center,
        customer_number: accountInfo.number,
        weight: parcel.weight,
        referencenumber: parcel.reference || '',
        labelType: {
          type: labelFormat.value,
        },
        shippingdate: formatShippingDate(new Date(shippingDate)),
        retouraddress: {
          countryPrefix: senderAddress.countryCode,
          zipCode: senderAddress.postalCode,
          city: senderAddress.city,
          street: senderAddress.street1,
          name: senderAddress.firstName,
          phoneNumber: receiverAddress.mobileNumber || senderAddress.phoneNumber,
        },
        services: {
          // pickupAtCustomer:{
          //   time_from: '10:00',
          //   time_to: '18:00',
          // },
          contact: {
            // enum: No, Predict, AutomaticSMS, AutomaticMail
            type: dpdOption.contactType || 'No',
            sms: dpdOption.contactSms || '',
            email: dpdOption.contactEMail || '',
          },
        },
      },
    };

    if (shipment.parcel.insuranceValue) {
      data.request['services'] = _.cloneDeep({
        ...data.request['services'],
        extraInsurance: {
          value: shipment.parcel.insuranceValue,
          type: 'byShipments',
        },
      });
    }

    if (dpdOption && dpdOption.shipperAddress) {
      data.request['overrideShipperLabelAddress'] = data.request.shipperaddress;
      data.request.shipperaddress = dpdOption.shipperAddress;
    }

    const labelConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/dpd/Label.wsdl`,
      url: channelConfig.shipmentUrl,
      header: {
        'tns:UserCredentials': {
          'tns:userid': '{{username}}',
          'tns:password': '{{password}}',
        },
      },
      timeout: 10000,
    };

    const client: any = await new Soap().createClient(labelConfig, accountInfo);
    let responses: any;
    try {
      responses = await client['CreateShipmentWithLabelsAsync'](data);
    } catch (err) {
      throw new TransporterException('DPD', err.message, client.lastRequest);
    }

    const { labels, shipments } = responses[0]['CreateShipmentWithLabelsResult'];
    const { barcode, parcelnumber } = shipments.Shipment[0];
    const result: CreateParcelResponse = {
      trackingNumber: barcode,
      shippingNumber: parcelnumber,
      label: labels.Label[0].label,
      pickUp: labels.Label[1].label,
      labelFormat: labelFormat.labelType,
      transporterRequest: client.lastRequest,
      transporterResponse: client.lastResponse,
      cn23: '',
    };
    if (shipment.parcel && shipment.parcel.items && shipment.parcel.items.length > 0) {
      shipment['trackingNumber'] = barcode;
      result.invoice = GeneratorInvoicePdf.generator(shipment);
    }

    result.label = await this.pdfUtil.drawLogoOnLabel(
      result.label,
      channelConfig.platform,
      channelConfig.transporterId,
      channelConfig.labelFormat.code,
      dpdOption.enableCustomLogo,
    );
    return result;
  }

  async fetchTrackingOfficial({ trackingNumberArray, accountInfo }) {
    const trackingArray = [];
    const traceConfig = {
      wsdl: `${process.cwd()}/src/assets/wsdl/dpd/Trace.wsdl`,
      url: 'http://webtrace.dpd.fr/dpd-webservices/webtrace_service.asmx',
    };
    const client: any = await new Soap().createClient(traceConfig);
    for (const chunkTrackingNumberArray of _.chunk(trackingNumberArray, 50)) {
      const chunkTrackingArray = [];
      const promises = chunkTrackingNumberArray.map(async trackingNumber => {
        const data = {
          customer_center: accountInfo.center,
          customer: accountInfo.number,
          password: accountInfo.password,
          shipmentnumber: trackingNumber,
        };
        const responses = await client['getShipmentTraceAsync'](data);
        const rawTrackingArray = _.get(responses[0].getShipmentTraceResult, 'Traces.clsTrace', []);
        const tracking =
          rawTrackingArray && rawTrackingArray.length
            ? rawTrackingArray.map(rawTracking => toTracking(rawTracking, trackingNumber))
            : [];
        chunkTrackingArray.push(...tracking);
      });
      await Promise.all(promises);
      trackingArray.push(...chunkTrackingArray);
    }
    return trackingArray;
  }
}

function toTracking(rawTracking, trackingNumber) {
  const { ScanDate, ScanTime, StatusNumber, StatusDescription, CenterName } = rawTracking;
  return {
    trackingNumber,
    timestamp: moment.tz(`${ScanDate} ${ScanTime}`, 'DD.MM.YYYY HH:mm:ss', 'Europe/Paris').toDate(),
    event: StatusNumber,
    description: StatusDescription,
    location: CenterName,
  };
}

function formatShippingDate(date) {
  return moment.tz(date, 'Europe/Paris').format('DD.MM.YYYY');
}
