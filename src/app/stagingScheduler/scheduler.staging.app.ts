// patch default comportment
// 默认环境
import '../base/app.patch';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SchedulerStagingAppModule } from '@/app/stagingScheduler/scheduler.staging.app.module';
import { AllExceptionFilter } from '@/app/filter/all-exception.filter';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

async function bootStrapBatch() {
  const logger = new Logger('Scheduler');
  const app = await NestFactory.create(SchedulerStagingAppModule, { cors: true });

  // 全局异常处理
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  await app.listen(3100);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootStrapBatch().then(() => Logger.log('SchedulerStagingAppModule bootstrap success!!!'));
