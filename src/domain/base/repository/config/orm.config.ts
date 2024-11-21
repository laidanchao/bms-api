import { ConnectionOptions } from 'typeorm/connection/ConnectionOptions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// TODO weifeng 这里数据库用户名和密码统一使用postgres/postgres 端口5432? 还是有什么其他的考量? step2
export default (): ConnectionOptions => ({
  type: 'postgres',
  entities: ['test/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}'],
  subscribers: ['src/**/*.subscriber{.ts,.js}'],
  replication: {
    master: {
      host: process.env.DATABASE_WRITE_URL || 'localhost',
      port: Number.parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'cms',
    },
    slaves: [
      {
        host: process.env.DATABASE_READ_URL || 'localhost',
        port: Number.parseInt(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'cms',
      },
    ],
  },
  logging: process.env.TYPEORM_LOGGING === 'true' || false,
  // TODO weifeng 弄清楚它底层的逻辑, 很重要
  synchronize: (process.env.TYPEORM_SYNCHRONIZE === 'true' && process.env.NODE_ENV !== 'production') || false,
  dropSchema: false,
  // 跑测试环境的时候, 注意这个变量, 并且使用migaration初始化测试数据.
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true' || false,
  migrations: [process.env.TYPEORM_MIGRATIONS || 'src/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  migrationsTransactionMode: 'each',
  namingStrategy: new SnakeNamingStrategy(),
});
