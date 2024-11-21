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
import { BaseApplicationModule } from '@/application/base/base.application.module';
import { MyBullModule } from '@/domain/external/microservices/my-bull.module';
import { OrderCnApplicationModule } from '@/application/ord/order-cn.application.module';
import { CamCnApplicationModule } from '@/application/cam/cam-cn.application.module';
import { SciCnApplicationModule } from '@/application/sci/sci-cn.application.module';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, ormConfig],
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: [`${process.env.NODE_ENV}.env`],
    }),
    TypeOrmModule.forRoot(ormConfig()),
    RavenModule,
    ExternalModule,
    AwsModule,
    BaseApplicationModule,
    CamCnApplicationModule,
    OrderCnApplicationModule,
    SciCnApplicationModule,
    MyBullModule,
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
export class OrderAppModule {}
