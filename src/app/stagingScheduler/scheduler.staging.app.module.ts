import { Module } from '@nestjs/common';
import configuration from '../config/configuration';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheService } from '@/domain/external/cache/cache.service';
import { MyKafkaModule } from '@/domain/external/microservices/my-kafka.module';
import { MyBullModule } from '@/domain/external/microservices/my-bull.module';
import { JobModule } from '@/domain/job/job.module';
import { CrawlerModule } from '@/domain/sct/crawler/crawler.module';
import { ParcelProofApplicationModule } from '@/application/ord/parcel-proof.application.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@/app/guards/jwt.guard';
import { ClsGlobalModule } from '@/app/clsGlobal/cls.module';
import { NacosModule } from '@/domain/external/nacos/nacos.module';

// TODO 因为现在测试环境只有三台服务 无法同时启动 crawler 和 schedule
@Module({
  imports: [
    ConfigModule.forRoot({
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: [`${process.env.NODE_ENV}.env`],
      load: [configuration, ormConfig],
    }),
    ClsGlobalModule,
    TypeOrmModule.forRoot(ormConfig()),
    CrawlerModule,
    ParcelProofApplicationModule,
    MyKafkaModule,
    MyBullModule,
    JobModule,
    NacosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    RedisCacheService,
  ],
})
export class SchedulerStagingAppModule {}
