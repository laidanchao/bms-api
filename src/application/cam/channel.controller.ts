import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Crud, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChannelService } from '@/domain/cam/channel/channel.service';
import { CreateChannelDto, UpdateChannelDto } from '@/domain/cam/channel/dto';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { OperationLog } from '@/app/decorators/operation-log.decorator';
import { CrudAcl } from '@/app/decorators';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';
@Crud({
  model: {
    type: CamChannel,
  },
  dto: {
    create: CreateChannelDto,
    replace: UpdateChannelDto,
  },
  query: {
    join: {
      productInfo: {},
      transporter: {},
      'transporter.labelFormats': {},
    },
    alwaysPaginate: false, //前端没做分页
  },
  routes: {
    replaceOneBase: {
      decorators: [OperationLog({ operation: '修改' })],
    },
    createOneBase: {
      decorators: [OperationLog({ operation: '创建' })],
    },
  },
})
@ApiBearerAuth()
@ApiTags('channel')
@Controller('/api/cms/channel')
@CrudAcl({
  persist: user => {
    return {
      operator: user.username,
    };
  },
})
export class ChannelController {
  constructor(private readonly service: ChannelService, private readonly cls: ClsService) {}

  @Get('cpvInvoiceGetChannel')
  public async findChannel(@Query('wheres') wheres) {
    return await this.service.find(JSON.parse(wheres));
  }

  /**
   * 给平台提供渠道list
   */
  @Get('getList')
  public getList() {
    const platform = this.cls.get('platform');
    return this.service.getList(platform);
  }

  /**
   * 给平台提供修改渠道上默认寄件人地址配置
   * @param body
   */
  @Post('setSenderAddressCode')
  async setSenderAddressCode(@Body() body: { channel: string; senderAddressCode: string }) {
    const platform = this.cls.get('platform');
    return await this.service.setSenderAddressCode(body.channel, body.senderAddressCode, platform);
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
