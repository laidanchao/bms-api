import { SetMetadata } from '@nestjs/common';
export const IgnoreToken = (ignoreToken: boolean) => SetMetadata('ignoreToken', ignoreToken);
