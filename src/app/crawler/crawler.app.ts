// patch default comportment
// 默认环境
import '../base/app.patch';
import { Logger } from '@nestjs/common';
import { CrawlerAppModule } from '@/app/crawler/crawler.app.module';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionFilter } from '@/app/filter/all-exception.filter';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

async function bootStrapBatch() {
  const logger = new Logger('CrawlerApp');
  const app = await NestFactory.create(CrawlerAppModule, { cors: true });

  // 全局异常处理
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
  // add path prefix
  //TODO 为了完成健康检查接口去掉了此处的全局前缀 因为nestjs版本不够高，升级后可以使用exclude
  // app.setGlobalPrefix(API_PREFIX);
  await app.listen(3100);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootStrapBatch().then(() => Logger.log('CrawlerApp bootstrap success!!!'));
