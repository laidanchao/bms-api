import { Body, Controller, Get, Inject, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { CrawlerPlan } from '@/domain/sct/crawler/entity/crawler-plan.entity';
import { CrawlerPlanService } from '@/domain/sct/crawler/service/crawler-plan.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignUrlInterceptor } from '@/app/interceptors/signUrl.interceptor';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: CrawlerPlan,
  },
  routes: {
    only: ['getManyBase', 'getOneBase'],
  },
  query: {
    sort: [
      {
        field: 'createdAt',
        order: 'DESC',
      },
    ],
  },
})
@ApiBearerAuth()
@ApiTags('CrawlerPlan')
@Controller('/api/cms/crawlerPlan')
@UseInterceptors(SignUrlInterceptor)
export class CrawlerPlanController {
  @Inject()
  service: CrawlerPlanService;
  @Inject()
  cls: ClsService;

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

  @Get('signatureUrl/:id')
  getSignatureUrl(@Param('id') id: number) {
    return this.service.getSignatureUrl(id);
  }

  @Post('create')
  createCrawlerPlan(@Body() body) {
    return this.service.createCrawlerPlan(body);
  }
}
