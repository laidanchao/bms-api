import ormConfig from "./orm.config";

// 为了npm可以读取到配置
const config = ormConfig();
export = config;
