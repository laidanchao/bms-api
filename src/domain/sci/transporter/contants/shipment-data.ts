import {
  senderAddress,
  receiverAddress,
  receiverSpainAddress,
  senderSpainAddress,
  receiverChinaAddress,
  CH_RECEIVER_ADDRESS,
} from '@/domain/sci/transporter/contants/address-data';
import { cn23Items, parcel, parcels } from '@/domain/sci/transporter/contants/parcel-data';

export const defaultShipment: any = {
  senderAddress,
  receiverAddress,
  parcel,
  pickupAt: null,
  shippingDate: new Date(),
  flexDeliveryService: null,
  shopReturnService: null,
  returnService: null,
  options: {},
};

export const multiShipment = {
  senderAddress,
  receiverAddress,
  parcels,
  options: {},
};

export const defaultShipmentWithItems: any = {
  senderAddress,
  receiverAddress: CH_RECEIVER_ADDRESS,
  parcel: {
    ...parcel,
    items: cn23Items,
  },
};

export const correosShipment = {
  senderAddress: senderSpainAddress,
  receiverAddress: receiverSpainAddress,
  parcel,
  shippingDate: new Date(),
};

export const xbsShipment = {
  senderAddress,
  receiverAddress: receiverChinaAddress,
  parcel: {
    ...parcel,
    items: cn23Items,
  },
};
export const fedexShipment = {
  ...xbsShipment,
  options: {},
};
