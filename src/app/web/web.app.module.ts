import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '@/app/config/orm.config';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard } from '@/app/guards/jwt.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import configuration from '../config/configuration';
import { ApiKeyGuard } from '@/app/guards/apiKey.guard';

import { ClsGlobalModule } from '@/app/cls/cls.module';
import { ClientModule } from '@/modules/crm/client/client.module';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: [path.join(__dirname, `../config/env/${process.env.NODE_ENV}.env`)],
      isGlobal:true,
    }),
    ClsGlobalModule,
    TypeOrmModule.forRoot(ormConfig()),
    RavenModule,
    ClientModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
    ApiKeyGuard,
  ],
})
export class WebAppModule {
}
