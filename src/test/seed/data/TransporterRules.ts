export const transporterRules = [
  {
    id: 9,
    createdAt: '2021-08-11T11:29:30.949Z',
    updatedAt: '2021-08-11T11:29:30.949Z',
    enable: true,
    client: 'a_WHITE',
    platform: 'FTL-OMS',
    rules: [
      {
        regEx: '/[(（].*?[)）]/g',
        replaceTo: '',
      },
      {
        regEx: '/[^A-Z]/g',
        replaceTo: ' ',
      },
      {
        regEx: '/\\s+/g',
        replaceTo: ' ',
      },
      {
        regEx: '/^\\s*|\\s*$/g',
        replaceTo: '',
      },
      {
        regEx: '/^(\\s*SAINT\\s+)(.*)$/',
        replaceTo: 'ST $2',
      },
      {
        regEx: '/ SAINT /g',
        replaceTo: ' ST ',
      },
    ],
    type: 'WHITE',
  },
  {
    id: 10,
    createdAt: '2021-08-11T11:30:14.907Z',
    updatedAt: '2021-08-11T11:30:14.907Z',
    enable: true,
    client: 'b_WHITE_BLACK',
    platform: 'FTL-OMS',
    rules: [],
    type: 'BLACK',
  },
  {
    id: 11,
    createdAt: '2021-08-11T11:30:29.403Z',
    updatedAt: '2021-08-11T11:30:29.403Z',
    enable: true,
    client: 'b_WHITE_BLACK',
    platform: 'FTL-OMS',
    rules: [
      {
        regEx: '/[(（].*?[)）]/g',
        replaceTo: '',
      },
      {
        regEx: '/[^A-Z]/g',
        replaceTo: ' ',
      },
      {
        regEx: '/\\s+/g',
        replaceTo: ' ',
      },
      {
        regEx: '/^\\s*|\\s*$/g',
        replaceTo: '',
      },
      {
        regEx: '/^(\\s*SAINT\\s+)(.*)$/',
        replaceTo: 'ST $2',
      },
      {
        regEx: '/ SAINT /g',
        replaceTo: ' ST ',
      },
    ],
    type: 'WHITE',
  },
  {
    id: 12,
    createdAt: '2021-08-11T11:30:42.617Z',
    updatedAt: '2021-08-11T11:30:42.617Z',
    enable: true,
    client: 'c_BLACK',
    platform: 'FTL-OMS',
    rules: [],
    type: 'BLACK',
  },
  {
    enable: true,
    client: '*',
    platform: 'CMS',
    rules: [],
    type: 'BLACK',
  },
];
