// 为了npm可以读取到配置
import ormConfig from '@/domain/base/repository/config/orm.config';
const config = ormConfig();
export = config;
