import { registerAs } from '@nestjs/config';

// !!!xiewenzhen 这里仍然使用旧的AWS账号, ftl-cms桶
export default registerAs('awsConfig', () => ({
  accessKeyId: process.env.CLOUD_S3_ACCESSKEY,
  secretAccessKey: process.env.CLOUD_S3_SECRETKEY,
}));
