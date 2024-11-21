import { Module } from '@nestjs/common';
import configuration from '../config/configuration';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmService } from '@/domain/external/scheduler/sm.service';
import { CrawlerModule } from '@/domain/sct/crawler/crawler.module';
import { JobController } from '@/application/job/job.controller';
import { CrawlerPlanExecutorJob } from '@/domain/job/sct/crawler-plan-executor-job.service';
import { CrawlTrackingJob } from '@/domain/job/sct/crawl-tracking-job.service';
import { ParcelProofApplicationModule } from '@/application/ord/parcel-proof.application.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '@/app/guards/jwt.guard';
import { ClsGlobalModule } from '@/app/clsGlobal/cls.module';
import { NacosModule } from '@/domain/external/nacos/nacos.module';

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
    NacosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    SmService,
    CrawlerPlanExecutorJob,
    CrawlTrackingJob,
  ],
  controllers: [JobController],
})
export class CrawlerAppModule {}
