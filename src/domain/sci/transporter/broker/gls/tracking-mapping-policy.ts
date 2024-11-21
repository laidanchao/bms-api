export const TrackingMappingPolicy = {
  fromDHLDEEvent,
  fromGLSEvent,
  fromGLSITEvent,
};

function fromGLSEvent(description) {
  switch (description) {
    case 'The parcel data was entered into the GLS IT system; the parcel was not yet handed over to GLS.':
      return 'CREATED';
    case 'The parcel was handed over to GLS.':
      return 'TRANSFERRED';
    case 'The parcel has reached the parcel center.':
      return 'REACHED';
    case 'The parcel has reached the ParcelShop.':
      return 'REACHED_SHOP';
    case 'The parcel has reached the parcel center and was sorted manually.':
      return 'REACHED_AND_SORTED';
    case 'The parcel has reached the parcel center, the parcel label is not readable.':
      return 'REACHED_AND_LABEL_UNREADABLE';
    case 'The parcel is stored in the parcel center.':
      return 'STORED';
    case 'The parcel is stored in the parcel center. It cannot be delivered as the reception is closed.':
      return 'STORED_AND_RECEPTION_CLOSE';
    case 'The parcel is stored in the parcel center to be delivered at a new delivery date.':
      return 'STORED_AND_NEW_DATE';
    case 'The parcel is stored in the parcel center. It cannot be delivered as the consignment is not complete.':
      return 'STORED_AND_CONSIGNMENT_NOT_COMPLETE';
    case 'The parcel is stored in the parcel center. It cannot be delivered as the consignee is on holidays.':
      return 'STORED_AND_CONSIGNEE_HOLIDAY';
    case 'The parcel has left the parcel center.':
      return 'LEFT';
    case 'The parcel is expected to be delivered during the day.':
      return 'DELIVERING';
    case 'The parcel could not be delivered as the consignee was absent.':
      return 'ABSENT';
    case 'The parcel is stored in the parcel center. It cannot be delivered as further address information is needed.':
      return 'STORED_AND_ADDRESS_NEEDED';
    case 'The parcel is stored in the GLS parcel center. The consignee has agreed to collect the goods himself.':
      return 'CONSIGNEE_COLLECT';
    case 'The parcel could not be delivered as the consignee is on holidays.':
      return 'CONSIGNEE_HOLIDAY';
    case 'The parcel could not be delivered due to exceeded time frame.':
      return 'EXCEEDED';
    case 'The parcel could not be delivered as further address information is needed.':
      return 'NOT_DELIVERED_AND_ADDRESS_NEEDED';
    case 'The parcel could not be delivered as the reception was closed.':
      return 'NOT_DELIVERED_AND_RECEPTION_CLOSE';
    case 'The parcel could not be delivered due to traffic problems.':
      return 'NOT_DELIVERED_FOR_TRAFFIC_PROBLEM';
    case 'The parcel has been delivered at the ParcelShop (see ParcelShop information).':
      return 'ARRIVED_SHOP';
    case 'The parcel has been delivered / dropped off.':
      return 'ARRIVED_DROP';
    case 'The parcel has been delivered at the neighbour´s (see signature)':
      return 'ARRIVED_NEIGHBOUR';
    case 'The parcel has been delivered.':
      return 'ARRIVED';
    case 'The parcel has been returned to sender.':
      return 'RETURNED';
    default:
      return 'DELIVERING';
  }
}

function fromGLSITEvent(description) {
  if (description.includes('Partita')) {
    return 'TRANSFERRED';
  }
  if (description.includes('CONSEGNATA')) {
    return 'ARRIVED';
  }
  return 'DELIVERING';
}

function fromDHLDEEvent(description) {
  switch (description) {
    case 'The instruction data for this shipment have been provided by the sender to DHL electronically':
      return 'CREATED';
    case 'The shipment has been successfully delivered':
    case 'The recipient has picked up the shipment from the retail outlet':
    case 'The recipient has picked up the shipment from the PACKSTATION':
      return 'ARRIVED';
    case 'The shipment has been delivered from the inbound parcel center to the recipient by simplified company delivery.':
    case 'Delivery successful.The shipment has been delivered from the inbound parcel center to the recipient by simplified company delivery.':
      return 'RETURNED';
    case 'The shipment has been processed in the parcel center of origin':
    case 'The shipment has been processed in the destination parcel center':
      return 'TRANSFERRED';
    default:
      return 'DELIVERING';
  }
}
