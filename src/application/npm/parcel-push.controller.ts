import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { ParcelPush } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { ParcelPushService } from '@/domain/npm/parcel-push/service/parcel-push.service';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: ParcelPush,
  },
  query: {
    sort: [{ field: 'id', order: 'DESC' }],
  },
})
@ApiBearerAuth()
@ApiTags('ParcelPush')
@Controller('/api/cms/npm/parcelPush')
export class ParcelPushController {
  constructor(private readonly service: ParcelPushService, private readonly cls: ClsService) {}

  @Override('getOneBase')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  public async getOne(@ParsedRequest() req: CrudRequest) {
    this.modifyRequest(req);
    return await this.service.getOne(req);
  }

  @Override('getManyBase')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  public async getMany(@ParsedRequest() req: CrudRequest) {
    this.modifyRequest(req);
    return await this.service.getMany(req);
  }

  private modifyRequest(req: CrudRequest) {
    const platform = this.cls.get('platform');
    if (platform) {
      req.parsed.search.$and.push({
        platform,
      });
    }
    return req;
  }
}
