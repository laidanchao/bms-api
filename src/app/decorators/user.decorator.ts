import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';

export type UserDto = {
  userId: number;
  userName: string;
  type: string;
  platform?: string;
  roles?: string[];
};
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (typeof request.user === 'string') {
    return {
      userId: 0,
      userName: request.user,
      type: '',
      platform: '',
      roles: [],
    };
  }
  const user: UserDto = {
    userId: _.toNumber(request.user.accountId),
    userName: _.toString(request.user.username),
    type: _.toString(request.user.type),
    platform: '',
    roles: request.user.roles.split(','),
  };
  return user;
});
