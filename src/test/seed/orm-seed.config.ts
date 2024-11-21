import ormConfig from '@/domain/base/repository/config/orm.config';

const ormconfig = {
  ...ormConfig(),
  migrations: [`${__dirname}/seed.ts`],
};
export = ormconfig;
