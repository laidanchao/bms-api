import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private permissionType: string[]) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const permissionType = request.headers['permissiontype'];

    if ([PermissionTypeEnum.ROOT].includes(permissionType)) return true;
    // 权限为空时 拒绝访问
    if (!permissionType) return false;

    // 非管理员用户需要匹配上对应权限才能访问
    return this.permissionType.includes(permissionType);
  }
}
