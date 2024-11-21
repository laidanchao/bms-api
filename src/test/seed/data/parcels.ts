// initialize data
export const parcels = [
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LP100004518FR',
    shippingNumber: 'LP100004518FR',
    transporter: 'ASENDIA',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LS855586595CH',
    shippingNumber: 'LS855586595CH',
    transporter: 'ASENDIA',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LP100004610FR',
    shippingNumber: 'LP100004610FR',
    transporter: 'ASENDIA',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LP100004929FR',
    shippingNumber: 'LP100004929FR',
    transporter: 'ASENDIA',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LP100005062FR',
    shippingNumber: 'LP100005062FR',
    transporter: 'CHRONOPOST',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: 'LP100003999FR',
    shippingNumber: 'LP100003999FR',
    transporter: 'ASENDIA',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
  },
  // prepared for ColissimoTrackingCompleteJob test
  {
    platform: 'FTL-OMS',
    trackingNumber: '6A2027338232A',
    shippingNumber: '6A2027338232A',
    transporter: 'COLISSIMO',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '6A2027338232B',
    shippingNumber: '6A2027338232B',
    transporter: 'COLISSIMO',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-24T23:59:59'),
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '6A2027338232C',
    shippingNumber: '6A2027338232C',
    transporter: 'COLISSIMO',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'SUSPEND',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 39,
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '6A2027338232D',
    shippingNumber: '6A2027338232D',
    transporter: 'COLISSIMO',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'SUSPEND',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  // prepared for colisprive tracking job test
  {
    platform: 'FTL-OMS',
    trackingNumber: '1D0000155122',
    shippingNumber: '1D0000155122',
    transporter: 'COLISPRIVE',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '1D0000150282',
    shippingNumber: '1D0000150282',
    transporter: 'COLISPRIVE',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '1D0000151631',
    shippingNumber: '1D0000151631',
    transporter: 'COLISPRIVE',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '1D0001194507',
    shippingNumber: '1D0001194507',
    transporter: 'COLISPRIVE',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  {
    platform: 'FTL-OMS',
    trackingNumber: '1D0000089633',
    shippingNumber: '1D0000089633',
    transporter: 'COLISPRIVE',
    declaredAt: new Date('2020-12-26T00:00:00Z'),
    status: 'CREATED',
    receiverCountryCode: 'FR',
    receiverPostalCode: 'FR_P',
    createdAt: new Date('2020-12-25T01:00:00Z'),
    spider: true,
    spiderCount: 41,
  },
  // prepared for buildMessage job test
  {
    platform: 'FTL-OMS',
    sync: false,
    trackingNumber: 'LP100005000FR',
    shippingNumber: 'LP100005000FR',
    transporter: 'COLISSIMO',
    declaredAt: new Date(),
    status: 'DELIVERING',
    lastTimestamps: '2019-12-27T17:00:00Z',
    sendMessageTime: '2019-12-30T17:00:00Z',
    clientId: 'SFI',
  },
  {
    platform: 'FTL-OMS',
    sync: false,
    trackingNumber: 'LP100005001FR',
    shippingNumber: 'LP100005001FR',
    transporter: 'COLISSIMO',
    declaredAt: new Date(),
    status: 'DELIVERING',
    sendMessageTime: '2019-12-30T17:00:00Z',
    clientId: 'SFI',
  },
  {
    platform: 'FTL-OMS',
    sync: false,
    trackingNumber: 'LP100005002FR',
    shippingNumber: 'LP100005002FR',
    transporter: 'COLISSIMO',
    declaredAt: new Date(),
    status: 'DELIVERING',
    lastTimestamps: '2019-12-31T17:00:00Z',
    clientId: 'SFI',
  },
  {
    platform: 'FTL-OMS',
    sync: false,
    trackingNumber: 'LP100005003FR',
    shippingNumber: 'LP100005003FR',
    transporter: 'COLISSIMO',
    declaredAt: new Date(),
    status: 'DELIVERING',
    lastTimestamps: '2019-12-31T17:00:00Z',
    sendMessageTime: '2019-12-30T17:00:00Z',
    clientId: 'SFI',
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598762050',
    shippingNumber: '6A20598762050',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.179Z',
    transferredAt: '2021-03-09T00:16:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'MLV_CFM',
    lastDescription: 'MLV_CFM',
    lastTimestamps: '2021-03-11T05:37:00.000Z',
    isLost: null,
    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    id: 123,
    createdAt: '2021-02-27T07:41:30.713Z',
    updatedAt: '2021-03-10T05:50:06.394Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20591298273',
    shippingNumber: '6A20591298273',
    transporter: 'COLISSIMO',
    declaredAt: '2021-02-27T07:41:30.712Z',
    transferredAt: '2021-03-09T18:51:00.000Z',
    arrivedAt: '2021-03-11T08:09:00.000Z',
    status: 'ARRIVED',
    error: null,
    deletedAt: null,
    aging: 1.6,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'LIV_CFM',
    lastDescription: 'LIV_CFM',
    lastTimestamps: '2021-03-11T08:09:00.000Z',
    isArrived: true,

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-10T05:50:06.389Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T05:43:51.764Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598762982',
    shippingNumber: '6A20598762982',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.180Z',
    transferredAt: '2021-03-09T23:28:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'AAR_CFM',
    lastDescription: 'AAR_CFM',
    lastTimestamps: '2021-03-11T04:56:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T05:43:51.760Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598763026',
    shippingNumber: '6A20598763026',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.179Z',
    transferredAt: '2021-03-10T19:18:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'PCH_CFM',
    lastDescription: 'PCH_CFM',
    lastTimestamps: '2021-03-11T08:58:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:36:21.259Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598822365',
    shippingNumber: '6A20598822365',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:36:21.258Z',
    transferredAt: '2021-03-10T15:18:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'PCH_CFM',
    lastDescription: 'PCH_CFM',
    lastTimestamps: '2021-03-11T05:21:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598765839',
    shippingNumber: '6A20598765839',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.180Z',
    transferredAt: '2021-03-09T12:43:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'MLV_CFM',
    lastDescription: 'MLV_CFM',
    lastTimestamps: '2021-03-11T07:13:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-02-15T07:41:06.565Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20535960174',
    shippingNumber: '6A20535960174',
    transporter: 'COLISSIMO',
    declaredAt: '2021-02-15T07:41:06.565Z',
    transferredAt: '2021-03-10T18:59:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'PCH_CFM',
    lastDescription: 'PCH_CFM',
    lastTimestamps: '2021-03-11T05:06:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T05:43:51.764Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598769608',
    shippingNumber: '6A20598769608',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.179Z',
    transferredAt: '2021-03-09T11:19:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'MLV_CFM',
    lastDescription: 'MLV_CFM',
    lastTimestamps: '2021-03-11T06:31:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T05:43:51.760Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-07T19:40:07.625Z',
    updatedAt: '2021-03-12T06:50:03.945Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20638723997',
    shippingNumber: '6A20638723997',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-07T19:40:07.582Z',
    transferredAt: '2021-03-10T15:17:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: null,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: null,
    lastEvent: 'PCH_CFM',
    lastDescription: 'PCH_CFM',
    lastTimestamps: '2021-03-11T05:52:00.000Z',

    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T06:50:03.937Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    createdAt: '2021-03-03T08:34:34.185Z',
    updatedAt: '2021-03-12T05:43:51.764Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20598769875',
    shippingNumber: '6A20598769875',
    transporter: 'COLISSIMO',
    declaredAt: '2021-03-03T08:34:34.179Z',
    transferredAt: '2021-03-09T16:43:00.000Z',
    arrivedAt: null,
    status: 'DELIVERING',
    error: null,
    deletedAt: null,
    aging: null,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '-1',
    test: false,
    lastEvent: 'AAR_CFM',
    lastDescription: 'AAR_CFM',
    lastTimestamps: '2021-03-11T05:57:00.000Z',
    clientId: 'YUN',
    sync: false,
    sendMessageTime: '2021-03-12T05:43:51.760Z',
    transporterAccountId: null,
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
  {
    id: 44854208,
    createdAt: '2021-04-28T02:44:55.892Z',
    updatedAt: '2021-04-29T12:00:22.172Z',
    platform: 'FTL-OMS',
    trackingNumber: '6A20952587237',
    shippingNumber: '6A20952587237',
    transporter: 'COLISSIMO',
    declaredAt: '2021-04-28T02:44:55.493Z',
    transferredAt: '2021-04-28T19:00:00.000Z',
    arrivedAt: '2021-04-29T08:01:00.000Z',
    status: 'ARRIVED',
    error: null,
    deletedAt: null,
    aging: 0.5,
    isReturned: false,
    returnedAt: null,
    receiverCountryCode: 'FR',
    receiverPostalCode: '78500',
    test: false,
    lastEvent: 'LIV_CFM',
    lastDescription: 'LIV_CFM',
    lastTimestamps: '2021-04-29T08:01:00.000Z',
    isArrived: true,
    isLost: null,
    clientId: 'HKJL',
    sync: true,
    sendMessageTime: '2021-04-29T12:00:22.169Z',
    transporterAccountId: '966036',
    spider: false,
    spiderCount: 0,
    channel: null,
    apiVersion: 'v1',
    insuranceValue: 0,
  },
];
