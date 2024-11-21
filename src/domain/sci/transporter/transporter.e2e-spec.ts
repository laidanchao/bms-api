import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransporterModule } from '@/domain/sci/transporter/transporter.module';

describe('Transporter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: 'test.env' }), TypeOrmModule.forRoot(ormSeed), TransporterModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    await request(app.getHttpServer())
      .get('/transporter')
      .expect(200)
      .expect((res: Response) => expect(res.body.length).toBe(11));
  });
});
