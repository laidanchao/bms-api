import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { CamSenderAddress } from '@/domain/cam/sender-address/entity/sender-address.entity';
import { SenderAddressService } from '@/domain/cam/sender-address/service/sender-address.service';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: CamSenderAddress,
  },
})
@Controller('/api/cms/senderAddress')
@ApiTags('senderAddress')
@ApiBearerAuth()
export class SenderAddressController {
  constructor(private readonly service: SenderAddressService, private readonly cls: ClsService) {}

  /**
   * 给平台提供渠道list
   */
  @Get('getList')
  getList() {
    const platform = this.cls.get('platform');
    return this.service.getList(platform);
  }

  @Get('getByCode/:code')
  getByCode(@Param('code') code: string) {
    const platform = 'FTL-OMS';
    return this.service.getByCode(code, platform);
  }

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
