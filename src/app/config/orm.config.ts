import { ConnectionOptions } from 'typeorm/connection/ConnectionOptions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default (): ConnectionOptions => ({
  type: 'postgres',
  entities: ['test/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}'],
  host: process.env.DATABASE_WRITE_URL || 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT) || 5434,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '123456',
  database: process.env.DATABASE_NAME || 'bms',
  logging: process.env.TYPEORM_LOGGING === 'true' || false,
  synchronize: false,
  dropSchema: false,
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true' || false,
  migrations: ['src/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  migrationsTransactionMode: 'each',
  namingStrategy: new SnakeNamingStrategy(),
});
