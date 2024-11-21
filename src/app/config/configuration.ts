// import * as yaml from 'js-yaml';
// import { join } from 'path';
// import * as fs from 'fs';
// import { ConfigFactory } from '@nestjs/config/dist/interfaces';
//
// const configFromYml = yaml.load(fs.readFileSync(join(`../../src/assets/yml`, `staging.yml`), 'utf8'));
//
// console.log(1)
// export default () => <ConfigFactory>configFromYml;

import devConfig from '@/app/config/env/dev.config';
import productionConfig from '@/app/config/env/production.config';
import productionOrderConfig from '@/app/config/env/production-order.config';
import stagingConfig from '@/app/config/env/staging.config';
import stagingOrderConfig from '@/app/config/env/staging-order.config';
import testConfig from '@/app/config/env/test.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: `${process.env.NODE_ENV}.env`,
      load: [testConfig, stagingConfig, devConfig, productionConfig, stagingOrderConfig, productionOrderConfig],
    }),
  ],
})
export class Configuration {}

function assignObj(target = {}, sources = {}) {
  const obj = target;
  if (typeof target != 'object' || typeof sources != 'object') {
    return sources; // 如果其中一个不是对象 就返回sources
  }
  for (const key in sources) {
    // 如果target也存在 那就再次合并
    if (target.hasOwnProperty(key)) {
      obj[key] = assignObj(target[key], sources[key]);
    } else {
      // 不存在就直接添加
      obj[key] = sources[key];
    }
  }
  return obj;
}

let configuration: any = devConfig();
switch (process.env.NODE_ENV) {
  case 'staging':
    configuration = assignObj(devConfig(), stagingConfig());
    break;
  case 'test':
    configuration = assignObj(devConfig(), testConfig());
    break;
  case 'production':
    configuration = productionConfig();
    break;
  case 'staging-cn':
    configuration = stagingOrderConfig();
    break;
  case 'production-cn':
    configuration = productionOrderConfig();
    break;
}

export default () => configuration;
