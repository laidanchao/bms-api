import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import Jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const ignoreToken: boolean =
      this.reflector.get<boolean>('ignoreToken', context.getClass()) ||
      this.reflector.get<boolean>('ignoreToken', context.getHandler());

    // access ignore token validate
    if (ignoreToken) {
      return true;
    }

    // validate authorization token
    const req: any = context.switchToHttp().getRequest();
    if (!req.headers.authorization) {
      return false;
    }
    const user: any = Jwt.decode(req.headers.authorization.replace('Bearer ', ''));
    if (!user) {
      return false;
    }
    req.user = user;
    return true;

  }
}
