// patch default comportment
// 默认环境
import '../base/app.patch';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SchedulerAppModule } from '@/app/scheduler/scheduler.app.module';
import { AllExceptionFilter } from '@/app/filter/all-exception.filter';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const API_PREFIX = 'api/cms/scheduler';

async function bootStrapBatch() {
  const logger = new Logger('Scheduler');
  const app = await NestFactory.create(SchedulerAppModule, { cors: true });
  // add path prefix
  //TODO 为了完成健康检查接口去掉了此处的全局前缀 因为nestjs版本不够高，升级后可以使用exclude
  // app.setGlobalPrefix(API_PREFIX);

  // 全局异常处理
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  await app.listen(3100);
  logger.log(`Platform is running on: ${await app.getUrl()}`);
}

bootStrapBatch().then(() => Logger.log('SchedulerApp bootstrap success!!!'));
