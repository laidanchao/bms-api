const accounts = [
  { account: 966036, accountInfo: { password: 'QNRq977', contractNumber: '966036' } },
  { account: 966262, accountInfo: { password: 'ftl123456789', contractNumber: '966262' } },
  { account: 812703, accountInfo: { password: 'ftljiaandy2014', contractNumber: '812703' } },
  { account: 955428, accountInfo: { password: 'p!rBH9fj', contractNumber: '955428' } },
  { account: 973648, accountInfo: { password: 't$TSg95z', contractNumber: '973648' } },
  { account: 835829, accountInfo: { password: 'ftlandy2016', contractNumber: '835829' } },
  { account: 925764, accountInfo: { password: 'rbll090', contractNumber: '925764' } },
  { account: 897769, accountInfo: { password: 'wMSk394', contractNumber: '897769' } },
  { account: 816272, accountInfo: { password: 'byjjiaandy1960', contractNumber: '816272' } },
  { account: 973649, accountInfo: { password: 'ftl973649', contractNumber: '973649' } },
  { account: 966037, accountInfo: { password: 'NBVE212', contractNumber: '966037' } },
  { account: 966037, accountInfo: { password: 'NBVE212', contractNumber: '966037' } },
  { account: 818301, accountInfo: { password: 'colis536859', contractNumber: '818301' } },
  { account: 869268, accountInfo: { password: '869268', contractNumber: '869268' } },
];

const shipment = {
  senderAddress: {
    city: 'paris',
    comment: '',
    company: 'X sociale',
    countryCode: 'FR',
    email: 'ddd@ggla.com',
    firstName: 'firstS',
    lastName: 'lastS',
    mobileNumber: '0659969984',
    phoneNumber: '0659969984',
    postalCode: '75018',
    street1: 'sender street address 1 ds',
    street2: 'sender street address 2 ds',
    street3: 'sender street address 3 ds',
  },
  receiverAddress: {
    city: 'Barcelona',
    comment: '',
    company: 'X sociale company',
    countryCode: 'ES',
    email: 'ddd@ggla.com',
    firstName: 'firstR',
    lastName: 'lastR',
    mobileNumber: '0659969984',
    phoneNumber: '0159969984',
    postalCode: '08015',
    street1: 'Av. de Mistral, 44',
    street2: 'receiver street address 2 ds',
    street3: 'receiver street address 3 ds',
  },
  parcel: {
    weight: 1,
    reference: 'test ref',
    insuranceValue: 0,
    items: [
      {
        value: 1,
        description: 'book',
        quantity: 1,
        weight: 1,
        hsCode: 123456,
      },
    ],
  },
  pickupAt: null,
  shippingDate: new Date(),
  flexDeliveryService: null,
  shopReturnService: null,
  returnService: null,
  options: {},
};

const shipmentsMapping = {
  DOM: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
  COL: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
  CORE: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
  DOS: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
  COLI: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'Roma',
        countryCode: 'IT',
        postalCode: '00161',
      },
    },
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'hang zhou',
        countryCode: 'CN',
        postalCode: '310000',
      },
    },
  ],
  COLD: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
  COM: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'ST FRANCOIS',
        countryCode: 'FR',
        postalCode: '97400',
      },
    },
  ],
  CDS: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'ST FRANCOIS',
        countryCode: 'FR',
        postalCode: '97400',
      },
    },
  ],
  COLR: [
    {
      senderAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75018',
      },
      receiverAddress: {
        city: 'paris',
        countryCode: 'FR',
        postalCode: '75005',
      },
    },
  ],
};

export { accounts, shipment, shipmentsMapping };
