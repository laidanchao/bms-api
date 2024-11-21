import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import Jwt from 'jsonwebtoken';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector, private nacosRepository: NacosRepository) {
    super();
  }

  /**
   *  1.cms授权了的平台才能访问cms所有服务
   *  2.cms超级管理员和平台管理员, 才能使用"渠道测试下单"接口
   *  3.cms普通用户不能使用"渠道测试下单"接口
   *  4.其他的菜单和接口权限, 按照Gateway的限制操作
   * @param context
   */
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
    const type = user.type;
    const platformId = user.group;
    const tokenType = user.tokenType;
    let platform = {};

    if (type === 'ROOT' || tokenType !== 'APP') {
      req.user = user;
      req.user.platform = platform;
      return true;
    } else {
      const platformConfigs = this.nacosRepository.getPlatformConfig();
      platform = platformConfigs.find(config => config.id === platformId && config.isActive);

      if (!platform) {
        return false;
      }
      req.user = user;
      req.user.platform = platform;
      return true;
    }
  }
}
