import { Module } from '@nestjs/common';
import configuration from '../config/configuration';
import { ConfigModule } from '@nestjs/config';
import ormConfig from '@/domain/base/repository/config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheService } from '@/domain/external/cache/cache.service';
import { MyKafkaModule } from '@/domain/external/microservices/my-kafka.module';
import { MyBullModule } from '@/domain/external/microservices/my-bull.module';
import { JobModule } from '@/domain/job/job.module';
import { ClsGlobalModule } from '@/app/clsGlobal/cls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: [`${process.env.NODE_ENV}.env`],
      load: [configuration, ormConfig],
    }),
    ClsGlobalModule,
    TypeOrmModule.forRoot(ormConfig()),
    MyKafkaModule,
    MyBullModule,
    JobModule,
  ],
  providers: [RedisCacheService],
})
export class SchedulerAppModule {}
