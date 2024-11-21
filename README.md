## 启动

### 配置文件

```
cp sample.env development.env
```

### 运行

```
npm install
npm start
```

## CLI

### migration

```
npm run migrate:create -n 文件名称
```

### 创建 resource

```
nest g -c @ftlab/schematics resource 模块名称
```

### seed

```
npm run migrate:seed
```

### web-cn

必要环境变量

```
  WHOLE_REDIS_URL
  REDIS_PASSWORD
  REDIS_HOST
  REDIS_PORT
  REDIS_DB
  GATEWAY_URL
  HTTP_MAX_REDIRECT=5
  HTTP_TIMEOUT=20000
  DD_SERVICE=cms-api
  DATABASE_WRITE_URL
  DATABASE_READ_URL
  DATABASE_USERNAME
  DATABASE_PORT=5432
  DATABASE_PASSWORD
  DATABASE_NAME=cms
  CLOUD_S3_SECRETKEY
  CLOUD_S3_ACCESSKEY
  TS_NODE_TRANSPILE_ONLY=true
  PORT=3001
  TYPEORM_MIGRATIONS_DIR=src/migrations
  TYPEORM_SYNCHRONIZE=false
  APP=start:server:cn

```

```
staging
  NODE_ENV=staging-cn
  TYPEORM_LOGGING=true
  DD_RUNTIME_METRICS_ENABLED=false
  TYPEORM_MIGRATIONS_RUN=true
  API_KEY=apiArc8uE8wvA5QMZD2FFkmepRnaK3fF

production
  NODE_ENV=production-cn
  TYPEORM_LOGGING=false
  DD_RUNTIME_METRICS_ENABLED=true
  TYPEORM_MIGRATIONS_RUN=false
```
