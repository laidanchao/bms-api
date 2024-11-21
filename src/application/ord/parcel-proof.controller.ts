import { Body, Controller, Get, Param, ParseBoolPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { ParcelProofService } from '@/domain/ord/parcel-proof/service/parcel-proof.service';
import { IgnoreToken } from '@/app/decorators';
import { Response } from 'express';
import { CrawlProofDto } from '@/domain/ord/parcel-proof/dto/crawl-proof.dto';
import { User, UserDto } from '@/app/decorators/user.decorator';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';
import { ParcelProof, ProofType } from '@/domain/ord/parcel-proof/entity/parcel-proof.entity';

@Crud({
  model: {
    type: ParcelProof,
  },
})
@Controller('/api/cms/task')
@ApiTags('task')
@ApiBearerAuth()
export class ParcelProofController {
  constructor(private readonly service: ParcelProofService, private readonly cls: ClsService) {}

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

  /**
   * 抓取单个POD
   * OMS和ESENDEO在使用
   * @param param
   * @param user
   */
  @Get('/crawlPod/:trackingNumber/:lang?')
  async crawlPod(
    @Param() param: { trackingNumber: string; lang: string },
    @Query('isGenerate') isGenerate = '0',
    @User() user: UserDto,
  ) {
    const { trackingNumber, lang } = param;
    return await this.service.crawlProof(
      trackingNumber.trim(),
      ProofType.POD,
      isGenerate === '1',
      lang || 'FR',
      user.userName,
    );
  }

  /**
   * 批量获取凭证
   * @param body
   * @param user
   */
  @Post('/crawlProofs')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async createTaskBatch(@Body() body: CrawlProofDto, @User() user: UserDto) {
    return await this.service.crawlProofs(body, user.userName);
  }

  /**
   * 获取POD文件
   * @param trackingNumber
   * @param res
   */
  @Get('/file/pod/:trackingNumber')
  @IgnoreToken(true)
  async getPodFile(@Param('trackingNumber') trackingNumber: string, @Res() res: Response) {
    return await this.service.getParcelPictureFile(trackingNumber, ProofType.POD, res);
  }

  /**
   * 获取包裹重量截图文件
   * @param trackingNumber
   * @param res
   */
  @Get('/file/pow/:trackingNumber')
  @IgnoreToken(true)
  async getWeightPictureFile(@Param('trackingNumber') trackingNumber: string, @Res() res: Response) {
    return await this.service.getParcelPictureFile(trackingNumber, ProofType.POW, res);
  }
}
