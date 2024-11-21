import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';

describe('TrackingHandlerService test', function() {
  it('handleColissimoReturnedParcel', function() {
    const trackingHandlerService = new TrackingHandlerService();

    const parcel1 = {
      transporter: 'COLISSIMO',
      platform: 'BE2SMART',
      isReturned: true,
      status: 'ARRIVED',
    };
    const resultParcel1 = trackingHandlerService['handleColissimoReturnedParcel'](parcel1);
    expect(resultParcel1.status).toEqual('RETURNED');

    const parcel2 = {
      transporter: 'COLISSIMO',
      platform: 'FTL-OMS',
      isReturned: true,
      status: 'ARRIVED',
    };
    const resultParcel2 = trackingHandlerService['handleColissimoReturnedParcel'](parcel2);
    expect(resultParcel2.status).toEqual('ARRIVED');

    const parcel3 = {
      transporter: 'GLS',
      platform: 'BE2SMART',
      isReturned: true,
      status: 'ARRIVED',
    };
    const resultParcel3 = trackingHandlerService['handleColissimoReturnedParcel'](parcel3);
    expect(resultParcel3.status).toEqual('ARRIVED');

    const parcel4 = {
      transporter: 'COLISSIMO',
      platform: 'BE2SMART',
      isReturned: false,
      status: 'ARRIVED',
    };
    const resultParcel4 = trackingHandlerService['handleColissimoReturnedParcel'](parcel4);
    expect(resultParcel4.status).toEqual('ARRIVED');

    const parcel5 = {
      transporter: 'COLISSIMO',
      platform: 'BE2SMART',
      isReturned: true,
      status: 'DELIVERING',
    };
    const resultParcel5 = trackingHandlerService['handleColissimoReturnedParcel'](parcel5);
    expect(resultParcel5.status).toEqual('DELIVERING');
  });
});
