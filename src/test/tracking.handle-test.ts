import * as _ from 'lodash';

describe('tracking handle', function() {
  it('tracking sort', async function() {
    const trackings = [
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'PCH_CFM',
        description: '',
        timestamp: '2022-09-29T05:55:00.000Z',
        location: '040410,TEST2',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'LIV_CFM',
        description: '',
        timestamp: '2022-09-29T05:55:00.000Z',
        location: '040410,TEST1',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'DCH_RCA',
        description: '',
        timestamp: '2022-09-27T05:55:00.000Z',
        location: '040410,TEST4',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'RST_BRT',
        description: '',
        timestamp: '2022-09-28T05:55:00.000Z',
        location: '040410,TEST3',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
    ];
    const trackingEvents = [
      {
        id: 2100021,
        createdAt: '2022-09-07T06:35:29.272Z',
        updatedAt: '2022-09-07T06:35:29.272Z',
        transporter: 'COLISSIMO',
        event: 'DCH_RCA',
        parcelStatus: 'RETURNED',
        zh: '包裹派送途中损坏,已退回至发件人',
        en: 'Your parcel has been returned to the sender following an incident.',
        fr: "Incident sur votre colis: celui-ci est renvoyé à l'expéditeur et nous vous prions d'accepter nos excuses.",
      },
      {
        id: 2099980,
        createdAt: '2022-09-07T06:35:28.898Z',
        updatedAt: '2022-09-07T06:35:28.898Z',
        transporter: 'COLISSIMO',
        event: 'RST_BRT',
        parcelStatus: 'DELIVERING',
        zh: '您的包裹被送到收集点。 一旦您的包裹可用，您将收到通知。',
        en:
          'Your package is sent to a collection point. You will receive a notification as soon as your package is available.',
        fr:
          'Votre colis est acheminé vers un point de retrait. Vous recevrez une notification dès que votre colis sera disponible.',
      },
      {
        id: 2100024,
        createdAt: '2022-09-07T06:35:29.272Z',
        updatedAt: '2022-09-07T06:35:29.272Z',
        transporter: 'COLISSIMO',
        event: 'LIV_CFM',
        parcelStatus: 'ARRIVED',
        zh: '包裹已送达',
        en: 'Your parcel was delivered',
        fr: 'Votre colis est livré.',
      },
      {
        id: 2100031,
        createdAt: '2022-09-07T06:35:29.272Z',
        updatedAt: '2022-09-07T06:35:29.272Z',
        transporter: 'COLISSIMO',
        event: 'PCH_CFM',
        parcelStatus: 'DELIVERING',
        zh: '包裹已在法邮注册， 派送中',
        en: 'Your parcel is being processed by La Poste, it is currently shipped',
        fr: "Votre colis est pris en charge par La Poste, il est en cours d'acheminement.",
      },
    ];
    const transporter = 'COLISSIMO';
    const trackingSetSortBy = trackings.sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        const a_parcelStatus =
          _.find(trackingEvents, v => v.event === a.event && v.transporter === transporter)?.parcelStatus || '';
        const b_parcelStatus =
          _.find(trackingEvents, v => v.event === b.event && v.transporter === transporter)?.parcelStatus || '';
        if (a_parcelStatus === 'ARRIVED') {
          return 1;
        } else if (b_parcelStatus === 'ARRIVED') {
          return -1;
        }
      } else {
        return a.timestamp > b.timestamp ? 1 : -1;
      }
    });

    expect(trackingSetSortBy).toEqual([
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'DCH_RCA',
        description: '',
        timestamp: '2022-09-27T05:55:00.000Z',
        location: '040410,TEST4',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'RST_BRT',
        description: '',
        timestamp: '2022-09-28T05:55:00.000Z',
        location: '040410,TEST3',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'PCH_CFM',
        description: '',
        timestamp: '2022-09-29T05:55:00.000Z',
        location: '040410,TEST2',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
      {
        trackingNumber: '6A23546952046',
        reference: 'LP95676041000628712220',
        event: 'LIV_CFM',
        description: '',
        timestamp: '2022-09-29T05:55:00.000Z',
        location: '040410,TEST1',
        fileName: '964836.220929.0826.1125894.ok',
        fromFile: true,
        supplierWeight: 790,
      },
    ]);
  });
});
