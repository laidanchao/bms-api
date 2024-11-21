import { TransporterBroker } from '@/domain/sci/transporter/broker/transporter-broker';

export class ClientMock extends TransporterBroker {
  // TODO mock other function
  async create(dto) {
    if (dto.parcel) {
      return {
        trackingNumber: '1Z534F106817749572',
        shippingNumber: '1Z534F106817749572',
        labelFormat: dto.labelFormat,
        label: 'xxxx',
      };
    }
    if (dto.parcels) {
      return [
        {
          trackingNumber: '1Z534F106817749572',
          shippingNumber: '1Z534F106817749572',
          labelFormat: dto.labelFormat,
          label: 'xxxx1',
        },
        {
          trackingNumber: '1Z534F106817749572',
          shippingNumber: '1Z534F106817749572',
          labelFormat: dto.labelFormat,
          label: 'xxxx2',
        },
      ];
    }
  }
}
