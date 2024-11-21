import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard } from '@/app/guards/jwt.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { RedisCacheService } from '@/domain/external/cache/cache.service';
import configuration from '../config/configuration';
import { ExternalModule } from '@/domain/external/external.module';
import { WebhookJwtStrategy } from '@/app/guards/webhookJwt.strategy';
import { ApiKeyGuard } from '@/app/guards/apiKey.guard';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { CamApplicationModule } from '@/application/cam/cam.application.module';
import { NpmApplicationModule } from '@/application/npm/npm.application.module';
import { OrdApplicationModule } from '@/application/ord/ord.application.module';
import { ScbApplicationModule } from '@/application/scb/scb.application.module';
import { SciApplicationModule } from '@/application/sci/sci.application.module';
import { SctApplicationModule } from '@/application/sct/sct.application.module';
import { SrsApplicationModule } from '@/application/srs/srs.application.module';
import { BaseApplicationModule } from '@/application/base/base.application.module';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { ClsGlobalModule } from '@/app/clsGlobal/cls.module';
import { SystemVariableModule } from '@/domain/base/ssm/system/system-variable.module';
import { SsmApplicationModule } from '@/application/ssm/ssm.application.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, ormConfig],
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: [`${process.env.NODE_ENV}.env`],
    }),
    ClsGlobalModule,
    TypeOrmModule.forRoot(ormConfig()),
    RavenModule,
    ExternalModule,
    AwsModule,
    BaseApplicationModule,
    CamApplicationModule,
    SsmApplicationModule,
    NpmApplicationModule,
    OrdApplicationModule,
    ScbApplicationModule,
    SciApplicationModule,
    SctApplicationModule,
    SrsApplicationModule,
    SystemVariableModule,
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
    RedisCacheService,
    XPushService,
    WebhookJwtStrategy,
    ApiKeyGuard,
  ],
})
export class WebAppModule {}
