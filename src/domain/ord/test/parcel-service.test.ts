import removeAccents from 'remove-accents';
import { defaultShipment } from '@/domain/sci/transporter/contants';
import { writeLabelAndLog } from '@/domain/sci/transporter/broker/common/test-utils';
import { RedisCacheService } from '@/domain/external/cache/cache.service';
import { INestApplication } from '@nestjs/common';
import { ParcelService } from '@/domain/ord/parcel/service/parcel.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelModule } from '@/domain/ord/parcel/parcel.module';
import ormConfig from '@/domain/base/repository/config/orm.config';

describe('ParcelService', () => {
  let app: INestApplication;
  let parcelService: ParcelService;

  // init testing module and data
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
        ParcelModule,
        RedisCacheService,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    parcelService = await module.resolve(ParcelService);
  });

  // it('should getCityPostalCodeArray', async function() {
  //   const result = await parcelService.getCityPostalCodeArray();
  //   expect(result).toHaveLength(35724);
  // });

  //
  // it('getTrackings with multiple languages ', async () => {
  //   const trackings = await parcelService.getTrackings('6A20952587237', { language: 'zh,en', order: undefined });
  //   expect(trackings).toMatchObject({
  //     zh: [
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'COM_CFM',
  //         description: '该包裹在法邮注册,等待签收',
  //         timestamp: new Date('2021-04-28T02:44:00.000Z'),
  //         location: '009910,VENTE ON LINE',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'PCH_CFM',
  //         description: '法邮已签收, 派送中',
  //         timestamp: new Date('2021-04-28T19:00:00.000Z'),
  //         location: '053628,LE THILLAY PFC',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'AAR_CFM',
  //         description: '包裹已到达分捡中心',
  //         timestamp: new Date('2021-04-29T02:28:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'MLV_CFM',
  //         description: '包裹将在收件人选择的日期预约递送',
  //         timestamp: new Date('2021-04-29T06:23:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'LIV_CFM',
  //         description: '包裹已送达',
  //         timestamp: new Date('2021-04-29T08:01:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //     ],
  //     en: [
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'COM_CFM',
  //         description: 'La Poste is handling your parcel. It is currently being routed.',
  //         timestamp: new Date('2021-04-28T02:44:00.000Z'),
  //         location: '009910,VENTE ON LINE',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'PCH_CFM',
  //         description: 'Your parcel is being processed by La Poste, it is currently shipped',
  //         timestamp: new Date('2021-04-28T19:00:00.000Z'),
  //         location: '053628,LE THILLAY PFC',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'AAR_CFM',
  //         description: 'Your parcel has arrived at its delivery location',
  //         timestamp: new Date('2021-04-29T02:28:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'MLV_CFM',
  //         description: 'Your parcel is being delivered to a pick-up location.',
  //         timestamp: new Date('2021-04-29T06:23:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //       {
  //         trackingNumber: '6A20952587237',
  //         reference: '121-210428-0003',
  //         event: 'LIV_CFM',
  //         description: 'Your parcel was delivered',
  //         timestamp: new Date('2021-04-29T08:01:00.000Z'),
  //         location: '042584,POISSY AGENCE COLISSIMO',
  //       },
  //     ],
  //   });
  // });

  // it('city postalCode validate', async () => {
  //   const result = await parcelService._validateForBjywAndYdh('94190', 'VILLENEUVE SAINT GEORGES', 'ABC');
  //   expect(result).toEqual('VILLENEUVE ST GEORGES');
  //   const result0 = await parcelService._validateForBjywAndYdh('77600', 'Bussy Saint Georges', 'ABC');
  //   expect(result0).toEqual('BUSSY ST GEORGES');
  //   const result1 = await parcelService._validateForBjywAndYdh('77600', '(123)Bussy（123） .,Saint Georges', 'ABC');
  //   expect(result1).toEqual('BUSSY ST GEORGES');
  //   await expect(parcelService._validateForBjywAndYdh('77006', 'paris', 'ABC')).rejects.toThrow(BusinessException);
  //   await expect(parcelService._validateForBjywAndYdh('97100', 'RULLY', 'ABC')).rejects.toThrow(BusinessException);
  //   await expect(parcelService._validateForBjywAndYdh('75006', 'éÔEO', 'ABC')).rejects.toThrow(BusinessException);
  //   await expect(parcelService._validateForBjywAndYdh('73006', 'saintparis', 'ABC')).rejects.toThrow(BusinessException);
  //   await expect(parcelService._validateForBjywAndYdh('', 'saintparis', 'ABC')).rejects.toThrow(BusinessException);
  // });

  it.skip('should create parcel', async function() {
    let data = {
      clientId: 'a',
      labelFormat: 'A4_PDF',
      code: 'CM_OMS_12',
      platform: 'FTL-OMS',
      receiverAddress: {
        postalCode: '77600',
        city: '(123)Bussy（123） .,Saint Georges',
        comment: '',
        company: 'X sociale company',
        countryCode: 'FR',
        email: 'ddd@ggla.com',
        firstName: 'firstR',
        lastName: 'lastR',
        mobileNumber: '0659969984',
        phoneNumber: '0159969984',
        street1: 'Av. de Mistral, 44',
        street2: 'receiver street address 2 ds',
        street3: 'receiver street address 3 ds',
      },
    };
    data = Object.assign(defaultShipment, data);
    const result = await parcelService.createParcel(data);
    expect(result).not.toBeNull();
    await writeLabelAndLog('COLISSIMO', result);
  });

  it('should valid city success', async function() {
    // const trackings = await parcelService._validateForBjywAndYdh((postalCode, city, client);
    let city = 'SAINT Lab ABSAINT SAINTGG';
    const result1 = city.replace(/\bSAINT\b/, 'ST');
    expect(result1).toEqual('ST Lab ABSAINT SAINTGG');
    city = ',Hello,.Bd_，Paris真不做—— S2Z';
    const result3 = city.replace(/[^A-Z]/g, '');
    expect(result3).toEqual('HBPSZ');
    city = '(.)AB., (123)cD, G=(123)BEUVRY LA（YY） FORET';
    city = removeAccents(city);
    city = city.toUpperCase();
    city = city.replace(/[\(（].*?[\)）]/g, '');
    city = city.replace(/[^A-Z]/g, ' ');
    city = city.replace(/^(SAINT )(.*)$/, 'ST $2');
    city = city.replace(/[^A-Z]/g, '');
    // const result4 = city.replace(/[\(（].*?[\)）]/g, '');
    const result4 = city;
    expect(result4).toEqual('ABCDGBEUVRYLAFORET');
  });

  it('remove accents', () => {
    let city = '{}[]<>:`,.|?/ // {}【】《》、：|.·，？。SâINT MâURIçè AUX RIçHéS HÔMMÉS';
    city = removeAccents(city);
    city = city.toUpperCase();
    city = city.replace(/[\(（].*?[\)）]/g, '');
    city = city.replace(/[^A-Z]/g, ' ');
    city = city.replace(/^(\s*SAINT\s*)(.*)$/, 'ST $2');
    city = city.replace(/[^A-Z]/g, '');
    expect(city).toEqual('STMAURICEAUXRICHESHOMMES');
  });

  it('replace s制表符', function() {
    let city = 'SAINT    Here';
    city = city.replace(/^(\s*SAINT\s+)(.*)$/, 'ST $2');
    expect(city).toEqual('ST Here');
  });

  it('replace multi空格 为单空格', function() {
    let city = '           SAINT    Here A1         3333         (*77k)nihao   Helloworld  ';
    const sourceCity = city;
    city = removeAccents(city);
    city = city.toUpperCase();
    city = city.replace(/[\(（].*?[\)）]/g, '');
    city = city.replace(/[^A-Z]/g, ' ');
    city = city.replace(/\s+/g, ' ');
    city = city.replace(/^\s*|\s*$/g, '');
    city = city.replace(/^(\s*SAINT\s+)(.*)$/, 'ST $2');
    expect(city).toEqual('ST HERE A NIHAO HELLOWORLD');
    expect(sourceCity).toEqual('           SAINT    Here A1         3333         (*77k)nihao   Helloworld  ');
  });

  it('should dafdasiouo', function() {
    const rule = [
      { regEx: '/[(（].*?[)）]/g', replaceTo: '' },
      { regEx: '/[^A-Z]/g', replaceTo: ' ' },
      { regEx: '/\\s+/g', replaceTo: ' ' },
      { regEx: '/^\\s*|\\s*$/g', replaceTo: '' },
      { regEx: '/^(\\s*SAINT\\s+)(.*)$/', replaceTo: 'ST $2' },
    ];
    let city = 'CHALO SAINT MARS';
    // const sourceCity = city;
    city = removeAccents(city);
    city = city.toUpperCase();
    rule.forEach(rule => {
      const regex = eval(rule.regEx);
      city = city.replace(regex, rule.replaceTo);
    });
    console.log(city);
  });
});
