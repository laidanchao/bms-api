// patch default comportment
// 默认环境
import { AllExceptionFilter } from '@/app/filter/all-exception.filter';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
// 加载补丁
import '../base/app.patch';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { OrderAppModule } from '@/app/order/order.app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
// main.patch
const API_PREFIX = 'api/cms';

async function bootstrap() {
  const logger = new Logger('WebCnApp');
  const app = await NestFactory.create(OrderAppModule, { cors: true });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 全局数据body校验转换
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
  );

  // 全局异常处理
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // swagger
  const options = new DocumentBuilder()
    .setTitle('CMS API')
    .setDescription('API Documentation')
    .setVersion('0.3')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup(`${API_PREFIX}/documentation`, app, document);

  app.use(compression());
  app.use(helmet());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Server on http://127.0.0.1:${port}`);
}

bootstrap().then(() => Logger.log('App[CN] bootstrap success!!!'));
