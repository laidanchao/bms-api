import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { TrackingPush } from '../../domain/npm/tracking-push/entities/tracking-push.entity';
import { TrackingPushService } from '@/domain/npm/tracking-push/service/tracking-push.service';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: TrackingPush,
  },
  query: {
    sort: [{ field: 'id', order: 'DESC' }],
  },
})
@ApiBearerAuth()
@ApiTags('TrackingPush')
@Controller('/api/cms/npm/trackingPush')
export class TrackingPushController {
  constructor(private readonly service: TrackingPushService, private readonly cls: ClsService) {}

  @Override('getOneBase')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  public async getOne(@ParsedRequest() req: CrudRequest) {
    this.modifyRequest(req);
    return await this.service.getOne(req);
  }

  @Override('getManyBase')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  public async getMany(@ParsedRequest() req: CrudRequest) {
    this.modifyRequest(req);
    return await this.service.getMany(req);
  }

  private modifyRequest(req: CrudRequest) {
    const platform = this.cls.get('platform');
    const client = this.cls.get('client');
    if (platform) {
      req.parsed.search.$and.push({
        platform,
      });
    }
    if (client) {
      req.parsed.search.$and.push({
        clientId: client,
      });
    }
    return req;
  }
}
