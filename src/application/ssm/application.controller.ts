import { Controller, Get, UseGuards } from '@nestjs/common';
import { Crud, CrudRequest, GetManyDefaultResponse, Override, ParsedRequest } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformService } from '@/domain/base/ssm/platform/platform.service';
import { Create_applicationDto, Update_applicationDto } from '@/domain/base/ssm/platform/dto';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: Platform,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: 'id',
    },
  },
  dto: {
    create: Create_applicationDto,
    replace: Update_applicationDto,
  },
  routes: {
    exclude: ['createOneBase', 'deleteOneBase', 'updateOneBase', 'createManyBase'],
  },
  query: {
    alwaysPaginate: false,
    sort: [{ field: 'createdAt', order: 'DESC' }],
  },
})
@ApiBearerAuth()
@ApiTags('platform')
@Controller('/api/cms/platform')
export class PlatformController {
  constructor(private readonly service: PlatformService, private readonly cls: ClsService) {}

  @Get('getList')
  public async getList() {
    const applications = await this.service.find();
    return <GetManyDefaultResponse<Platform>>{
      data: applications,
      total: applications.length,
      count: applications.length,
      pageCount: 1,
      page: 1,
    };
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
        id: platform,
      });
    }
    return req;
  }
}
