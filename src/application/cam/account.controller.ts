import { Controller, ForbiddenException, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { dto } from '@/domain/sci/transporter/dto';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { AccountService } from '@/domain/cam/account/account.service';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: Account,
  },
  dto,
  query: {},
  params: {},
})
@Controller('/api/cms/account')
@ApiTags('account')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly service: AccountService, private readonly cls: ClsService) {}

  @Get('getAccountByQuery')
  public async findAccount(@Query('wheres') wheres) {
    return await this.service.find(JSON.parse(wheres));
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
        platform: platform,
      });
    }
    return req;
  }
}
