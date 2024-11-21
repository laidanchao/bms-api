import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';
import { classToPlain } from 'class-transformer';
import { CreateLabel } from '@/domain/sci/transporter/broker/dpd/zz/request/create-label';
import { ParcelDto } from '@/domain/ord/parcel/dto';
import { Logger } from '@/app/logger';

export class DataBuilder {
  static buildBody(timeDifference, token, serviceType, customerName, shipment) {
    const timeStamp = new Date().getTime() + timeDifference;
    const createLabel = this.buildRequestData(shipment, serviceType, customerName);
    const requestData = JSON.stringify(classToPlain(createLabel));
    const content = 'TimeStamp=' + timeStamp + '&Data=' + requestData;
    const params = 'AccessToken=' + token + "&Signature=''&" + content;
    Logger.info(params);
    const body = encodeURIComponent(params);
    return { body, createLabel };
  }

  static buildRequestData(shipment: CreateClientDto, serviceType: string, customerName: string) {
    const senderAddress = shipment.senderAddress;
    const receiverAddress = shipment.receiverAddress;
    const parcels: ParcelDto[] = shipment.parcels;

    const createLabel: CreateLabel = new CreateLabel(senderAddress, receiverAddress, parcels, {
      serviceTypeName: serviceType,
      customerName,
    });

    return createLabel;
  }
}
