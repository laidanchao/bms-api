if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'staging';
}
// 加载补丁
import '../base/app.patch';
import { NestFactory } from '@nestjs/core';
import { WebAppModule } from '@/app/web/web.app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
// main.patch
const API_PREFIX = 'api/bms';

async function bootstrap() {
  const logger = new Logger('WebApp');
  const app = await NestFactory.create(WebAppModule, { cors: true });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 全局数据body校验转换
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
  );

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

bootstrap().then(() => Logger.log('App bootstrap success!!!'));
