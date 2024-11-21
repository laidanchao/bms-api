import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';

@Module({
  imports: [
    ClsModule.register({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          let platform = '';
          let client = '';
          const permissionType = req.headers['permissiontype'];
          if (permissionType === PermissionTypeEnum.PLATFORM) {
            platform = req.headers['permissioncode'];
          } else if (permissionType === PermissionTypeEnum.CLIENT) {
            client = req.headers['permissioncode'];
          }
          // 内嵌到系统系统后通信获得, cms 系统自己登录不涉及平台的切换
          if (permissionType === PermissionTypeEnum.ROOT && req.headers['platform']) {
            platform = req.headers['platform'];
          }
          cls.set('platform', platform);
          cls.set('client', client);
          cls.set('permissionType', permissionType);
        },
      },
    }),
  ],
})
export class ClsGlobalModule {}
