import { AsendiaBroker } from '@/domain/sci/transporter/broker/asendia/asendia.broker';
import { BaseConfig } from '@/domain/sci/transporter/base-config';
import { asendiaAccount, defaultShipment } from '@/domain/sci/transporter/contants';
import _ from 'lodash';
import { Moment } from '@softbrains/common-utils';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';

const config: BaseConfig = {
  // 配置同生产环境
  productCode: 'EP',
  accountInfo: {
    ApiToken: 'a2ea5633b645d6d6a3d0d65260af1efb',
    access_token:
      'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IntcInByb2ZpbGVVc2VyXCI6e1wibmFtZVByb2ZpbGVcIjpbXCJCQ1wiXSxcInJpZ2h0XCI6W3tcIm5hbWVcIjpcIk9wZXJhdGlvbnMgYWxlcnRzXCIsXCJ2aXNpYmxlXCI6dHJ1ZSxcInVwZGF0YWJsZVwiOmZhbHNlfSx7XCJuYW1lXCI6XCJBbmFseXNpc1wiLFwidmlzaWJsZVwiOnRydWUsXCJ1cGRhdGFibGVcIjp0cnVlfSx7XCJuYW1lXCI6XCJFdmVudHMgYWxlcnRzXCIsXCJ2aXNpYmxlXCI6dHJ1ZSxcInVwZGF0YWJsZVwiOmZhbHNlfV19LFwic2NvcGVcIjp7XCJjcm1JZFwiOlwiSEsxODA4MDAwMlwiLFwiYXNlbmRpYU9yZ2FuaXphdGlvbk5hbWVcIjpudWxsfSxcIm5hbWVcIjpcIkFFWFNWQ1wiLFwibGFzdE5hbWVcIjpcIkhLMTgwODAwMDJcIixcImVtYWlsXCI6XCJhZXhzdmMuSEsxODA4MDAwMkBhc2VuZGlhLmNvcnBcIn0iLCJpYXQiOjE1NTc5OTQ3NTEsImV4cCI6MTU1ODA4MTE1MSwiaXNzIjoiYWV4c3ZjLkhLMTgwODAwMDJAYXNlbmRpYS5jb3JwIn0.o8x-mTlSqStb--YmS0TXxGWVjWEpqLLRzGTJLWehg7eBodRf7X2cboOkYuC3v6hpR-guGdJxU-R8ZDGqcTABxQ',
  },
  shipmentUrl: 'https://uat.asendiahk.com/openapi/user/1.2/addOrUpdateOrder',
  labelFormat: {
    code: 'A6_PDF',
    value: 'Label_100x150',
    labelType: 'pdf',
  },
};

const shipmentDto = {
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
  labelFormat: 'A6_PDF',
  parcel: {
    reference: 'ref 799312',
    weight: 1,
    items: [
      {
        description: 'test desc',
        quantity: 1,
        weight: 0.1,
        value: 1,
        originCountry: 'CN',
        hsCode: '123456',
      },
    ],
  },
  code: 'ASD_CMS_DSA',
  platform: 'CMS',
};

describe('Asendia Client', () => {
  const client = new AsendiaBroker();
  const transporter = 'Asendia';

  it('sec-create parcel', async () => {
    const result = await client.create(shipmentDto, config);
    expect(result.label).not.toBeNull();
    await writeLabelAndLog(transporter, result);
  });

  it('create by asendia client', async () => {
    const config: BaseConfig = {
      accountInfo: asendiaAccount,
      shipmentUrl: 'http://api.asendiahk.com/openapi/user/1.2/addOrUpdateOrder',
      labelFormat: {
        labelType: 'pdf',
        value: 'Label_100x150',
      },
    };
    defaultShipment.receiverAddress.countryCode = 'FR';
    defaultShipment.receiverAddress.postalCode = '75018';
    defaultShipment.receiverAddress.city = 'paris';
    defaultShipment.parcel.items.forEach(item => (item.originCountry = 'CN'));
    const result = await client.create(defaultShipment, config);
    expect(result.label).not.toBeNull();
    // save file
    await writeLabelAndLog(transporter, result);
  });

  it('should getLabel', async function() {
    const result = await client.getLabel({
      trackingNumber: 'LP166575436FR',
      account: asendiaAccount,
      labelFormat: {
        labelType: 'pdf',
        value: 'Label_100x150',
      },
    });
    expect(result).not.toBeNull();
  });

  it('should fetchTrackingUnofficial', async function() {
    const results = await client.fetchTrackingUnofficial({
      trackingNumberArray: ['AFREQK000058006'],
    });
    expect(results.length).toEqual(1);
  });

  // it('get label', async function() {
  //   const url = 'http://api.asendiahk.com/openapi/user/1.2/printOrder';
  //   const data = {
  //     ApiToken: 'a0eca40a938946f07aa10993c78cf031',
  //     LabelFormat: 'Label_100x150',
  //     OutPutFormat: 'pdf',
  //     PrintCustoms: true,
  //     OrderList: [
  //       {
  //         TrackingNo: 'LP165054442FR',
  //       },
  //     ],
  //   };
  //   const request = axios.default;
  //   const res = await request.post(url, data, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       json: true,
  //     },
  //   });
  //   console.log(res);
  // });

  // it('should 13', function() {
  //   const data = [
  //     { A: 'A1', v: 'V1', B: 'B1' },
  //     { A: 'A2', v: 'V2', B: 'B1' },
  //     { A: 'A1', v: 'V3', B: 'B2' },
  //     { A: 'A3', v: 'V4', B: 'B2' },
  //   ];
  //   const step1 = {
  //     A1: [
  //       { A: 'A1', v: 'V1', B: 'B1' },
  //       { A: 'A1', v: 'V3', B: 'B2' },
  //     ],
  //     A2: [{ A: 'A2', v: 'V2', B: 'B1' }],
  //     A3: [{ A: 'A3', v: 'V4', B: 'B2' }],
  //   };
  //   const result2 = _.flatMap(step1, (items, key) => {
  //     const result = _.groupBy(items, 'B');
  //     const step2 = _.flatMap(result, (items, key) => {
  //       const result = items;
  //       return { B: key, ...result };
  //     });
  //     return _.map(step2, item1 => ({ A: key, ...item1 }));
  //   });
  //   // const step2 = {
  //   //   B1: [{ A: 'A1', v: 'V1', B: 'B1' }],
  //   //   B2: [{ A: 'A1', v: 'V3', B: 'B2' }],
  //   // };
  //
  //   const keyOrFn = [
  //     { key: 'A', fn: item => item['A'] },
  //     { key: 'B', fn: item => item['B'] },
  //   ];
  //   const toTree1 = groupByKeyOrFn(data, keyOrFn);
  //   console.log(1);
  // });

  it('should groupby', function() {
    const data = [
      { transport: 'T1', v: 0, createdAt: '2019-10-01T10:10:00.000Z', client: 'YUN' },
      { transport: 'T1', v: 1, createdAt: '2019-10-01T10:10:00.000Z', client: 'YUN' },
      { transport: 'T2', v: 2, createdAt: '2019-10-01T11:11:00.000Z', client: 'YUN1' },
      { transport: 'T1', v: 3, createdAt: '2019-10-01T11:11:00.000Z', client: 'YUN1' },
    ];
    // const keys = [
    //   { key: 'transport', fn: parcel => parcel.transport },
    //   { key: 'createdAt', fn: parcel => Moment.utc(parcel.createdAt).format('HH') },
    // ];
    // const expected = groupByKeyOrFn(data, keys);

    const actual = _.groupBy(data, item => item.transport + Moment.utc(item.createdAt).format('HH'));
    expect(actual).toEqual({
      T110: [
        {
          client: 'YUN',
          createdAt: '2019-10-01T10:10:00.000Z',
          transport: 'T1',
          v: 0,
        },
        {
          client: 'YUN',
          createdAt: '2019-10-01T10:10:00.000Z',
          transport: 'T1',
          v: 1,
        },
      ],
      T111: [
        {
          client: 'YUN1',
          createdAt: '2019-10-01T11:11:00.000Z',
          transport: 'T1',
          v: 3,
        },
      ],
      T211: [
        {
          client: 'YUN1',
          createdAt: '2019-10-01T11:11:00.000Z',
          transport: 'T2',
          v: 2,
        },
      ],
    });
  });

  it('should utc format', function() {
    const createdAt = '2019-10-01T10:10:00.000Z';
    expect(Moment.utc(createdAt).format('HH')).toEqual('10');
    const createdAtDate = new Date('2019-10-01T10:10:00.000Z');
    expect(Moment.utc(createdAtDate).format('HH')).toEqual('10');
    const value = Moment.utc().format('HH');
    console.log(value);
  });
  /* eslint-disable */
  function toTree(array, keys: string[]) {
    if (keys.length === 0) {
      return [];
    }
    return _.chain(array)
      .groupBy(keys[0])
      .map((group, label) => {
        const result = toTree(group, keys.slice(1));
        return {
          label: label,
          children: result.length ? result : group,
        };
      })
      .value();
  }

  function groupByKeyOrFn(parcels, keyOrFnSet: any[]) {
    if (keyOrFnSet && keyOrFnSet.length) {
      const keyOrFn: any = keyOrFnSet[0];
      return _.chain(parcels)
        .groupBy(keyOrFn.fn)
        .flatMap((items, keyOrFnValue) => {
          const array = keyOrFnSet.slice(1);
          const parcels = groupByKeyOrFn(items, array);
          if (!array || !array.length) {
            return { [keyOrFn.key]: keyOrFnValue, parcels };
          }
          return _.map(parcels, parcel => ({ [keyOrFn.key]: keyOrFnValue, ...parcel }));
        })
        .value();
    }
    return parcels;
  }
  /* eslint-enable */
});
