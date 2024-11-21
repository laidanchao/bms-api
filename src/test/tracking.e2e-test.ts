import { INestApplication } from '@nestjs/common';
import { CreateTrackingDto } from '@/domain/sct/webhook/dto/create-tracking.dto';
import { Test, TestingModule } from '@nestjs/testing';
import ormConfig from '@/domain/base/repository/config/orm.config';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SctModule } from '@/domain/sct/sct.module';

describe.skip('[tracking] module', () => {
  let app: INestApplication;

  const payload: CreateTrackingDto = {
    trackingNumber: 'test',
    reference: 'test ref',
    event: 'pickup',
    description: 'pickup by ftl',
    timestamp: new Date().toISOString(),
    location: 'paris',
  };

  beforeAll(async function() {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SctModule,
        ConfigModule.forRoot({
          load: [ormConfig],
          envFilePath: 'test.env',
        }),
        TypeOrmModule.forRoot({
          ...ormConfig(),
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  it.skip('create tracking ', async () => {
    await request(app.getHttpServer())
      .post('/tracking')
      .set({
        Authorization:
          'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0NjQiLCJyb2xlcyI6IlJPTEVfQVBQIiwidXNlcm5hbWUiOiJlc2VuZGVvX3Jvb3QiLCJ0eXBlIjoiQUdFTkNZIiwiZ3JvdXAiOiJFU0VOREVPIiwib3duZXIiOiJFU0VOREVPIiwibGFuZ3VhZ2UiOiJjbiIsInZlcnNpb24iOiJ2MS4xIiwidG9rZW5UeXBlIjoiTE9HSU4iLCJhcHAiOiJDTVMiLCJqdGkiOiJiOWViZDUxMmVjNmI0ZjY0OWE3YmFlNTgyMzlhYjljOCJ9.A242JPU-lzooMJ2qFYDGdWeWIhKUI55G4p6cEHUdC6NH3CE6fQN-LAGF0_lErRjz9twJGcCHYa-ztVhQZ0Xw3Q',
      })
      .send(payload)
      .expect(201)
      .expect(res => expect(res.body).toMatchObject(payload));
  });
});
