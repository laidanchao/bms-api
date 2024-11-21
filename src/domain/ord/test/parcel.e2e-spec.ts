import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { CreateParcelDto } from '@/domain/ord/parcel/dto';
import request from 'supertest';
import { ParcelModule } from '@/domain/ord/parcel/parcel.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@/app/guards/jwt.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe.skip('[parcel] module', () => {
  let app: INestApplication;
  // let parcelService: ParcelService;

  const payload: CreateParcelDto = {
    platform: 'FTL-OMS',
    code: 'CLSM_ESD_1',
    labelFormat: 'A4_PDF',
    senderAddress: {
      firstName: 'first',
      lastName: 'last',
      company: 'company',
      city: 'paris',
      countryCode: 'FR',
      postalCode: '75013',
      street1: 'test street1',
      street2: 'test street2',
      street3: 'test street3',
      mobileNumber: '0650122677',
    },
    receiverAddress: {
      firstName: 'first',
      lastName: 'last',
      company: 'company',
      city: 'paris',
      countryCode: 'FR',
      postalCode: '75013',
      street1: 'test street1',
      street2: 'test street2',
      street3: 'test street3',
      mobileNumber: '0650122677',
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // 注册需要的模块, 从controller层触发.
      imports: [
        ParcelModule,
        ConfigModule.forRoot({
          load: [ormConfig],
          envFilePath: 'test.env',
        }),
        TypeOrmModule.forRoot({
          ...ormConfig(),
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: JwtGuard }],
    }).compile();

    // parcelService = module.get<ParcelService>(ParcelService);

    app = module.createNestApplication();
    await app.init();
  });

  describe.skip('success', () => {
    // it('create mono-parcel success', async () => {
    //   payload.parcel = {
    //     weight: 5,
    //     reference: 'test ref',
    //   };
    //
    //   jest.spyOn(parcelService, '_getClient').mockImplementation(() => new ClientMock());
    //   await request(app.getHttpServer())
    //     .post('/parcel')
    //     .set({
    //       Authorization:
    //         'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NjQiLCJyb2xlcyI6IlJPTEVfQVBQIiwidXNlcm5hbWUiOiJlc2VuZGVvX3Jvb3QiLCJ0eXBlIjoiQUdFTkNZIiwiZ3JvdXAiOiJFU0VOREVPIiwib3duZXIiOiJFU0VOREVPIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiTE9HSU4iLCJhcHAiOiJDTVMiLCJqdGkiOiJiOWViZDUxMmVjNmI0ZjY0OWE3YmFlNTgyMzlhYjljOCJ9.A242JPU-lzooMJ2qFYDGdWeWIhKUI55G4p6cEHUdC6NH3CE6fQN-LAGF0_lErRjz9twJGcCHYa-ztVhQZ0Xw3Q',
    //     })
    //     .send(payload)
    //     .expect(res => expect(res.body).toHaveProperty('label'));
    // });

    it('create multi parcel success', async () => {
      payload.parcels = [{ weight: 10 }, { weight: 5 }];
      payload.code = 'GLS_ESD_1';
      await request(app.getHttpServer())
        .post('/parcel')
        .set({
          Authorization:
            'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NjQiLCJyb2xlcyI6IlJPTEVfQVBQIiwidXNlcm5hbWUiOiJlc2VuZGVvX3Jvb3QiLCJ0eXBlIjoiQUdFTkNZIiwiZ3JvdXAiOiJFU0VOREVPIiwib3duZXIiOiJFU0VOREVPIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiTE9HSU4iLCJhcHAiOiJDTVMiLCJqdGkiOiJiOWViZDUxMmVjNmI0ZjY0OWE3YmFlNTgyMzlhYjljOCJ9.A242JPU-lzooMJ2qFYDGdWeWIhKUI55G4p6cEHUdC6NH3CE6fQN-LAGF0_lErRjz9twJGcCHYa-ztVhQZ0Xw3Q',
        })
        .send(payload)
        .expect(res => expect(res.body).toHaveProperty('parcels'));
    });
  });

  describe.skip('fail', () => {
    it('面单格式不正确', async () => {
      payload.labelFormat = 'TEST';
      await request(app.getHttpServer())
        .post('/parcel')
        .set({
          Authorization:
            'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NjQiLCJyb2xlcyI6IlJPTEVfQVBQIiwidXNlcm5hbWUiOiJlc2VuZGVvX3Jvb3QiLCJ0eXBlIjoiQUdFTkNZIiwiZ3JvdXAiOiJFU0VOREVPIiwib3duZXIiOiJFU0VOREVPIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiTE9HSU4iLCJhcHAiOiJDTVMiLCJqdGkiOiJiOWViZDUxMmVjNmI0ZjY0OWE3YmFlNTgyMzlhYjljOCJ9.A242JPU-lzooMJ2qFYDGdWeWIhKUI55G4p6cEHUdC6NH3CE6fQN-LAGF0_lErRjz9twJGcCHYa-ztVhQZ0Xw3Q',
        })
        .send(payload)
        .expect(res => expect(res.body.message).toEqual('面单格式不正确,请填写正确的面单格式'));
    });

    it('渠道尚未开通', async () => {
      payload.code = 'GLS_ESD_1';
      await request(app.getHttpServer())
        .post('/parcel')
        .set({
          Authorization:
            'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NjQiLCJyb2xlcyI6IlJPTEVfQVBQIiwidXNlcm5hbWUiOiJlc2VuZGVvX3Jvb3QiLCJ0eXBlIjoiQUdFTkNZIiwiZ3JvdXAiOiJFU0VOREVPIiwib3duZXIiOiJFU0VOREVPIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiTE9HSU4iLCJhcHAiOiJDTVMiLCJqdGkiOiJiOWViZDUxMmVjNmI0ZjY0OWE3YmFlNTgyMzlhYjljOCJ9.A242JPU-lzooMJ2qFYDGdWeWIhKUI55G4p6cEHUdC6NH3CE6fQN-LAGF0_lErRjz9twJGcCHYa-ztVhQZ0Xw3Q',
        })
        .send(payload)
        .expect(res => expect(res.body.message).toEqual('渠道尚未开通,请联系管理员'));
    });
  });
});
