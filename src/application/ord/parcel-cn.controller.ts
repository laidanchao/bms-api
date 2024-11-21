import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Req, UseInterceptors } from '@nestjs/common';
import { Crud, Override, ParsedBody } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParcelService } from '@/domain/ord/parcel/service/parcel.service';
import { CancelParcelDto, CreateParcelDto } from '@/domain/ord/parcel/dto';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { CrudAcl } from '@/app/decorators';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { OrderValidateInterceptor } from '@/app/interceptors/order-validate.interceptor';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import { SyncParcelInfoDto } from '@/domain/ord/parcel/dto/sync-parcel-info.dto';
import { JOB_SUCCESS, STATE } from '@/application/job/job.controller';
import { Logger } from '@/app/logger';
import { SmService } from '@/domain/external/scheduler/sm.service';

export interface pageParamsType {
  page: number;
  limit: number;
  trackingNumbers: string[];
  sort: any[];
}

@Crud({
  model: {
    type: Parcel,
  },
  dto: {
    create: CreateParcelDto,
  },
  routes: {
    exclude: ['deleteOneBase', 'replaceOneBase', 'createManyBase', 'updateOneBase'],
  },
})
// TODO filter
@CrudAcl({
  property: 'user',
  persist: user => ({ user }),
})
@ApiBearerAuth()
@ApiTags('parcel')
@Controller('/api/cms/parcel')
export class ParcelCnController {
  constructor(
    private readonly service: ParcelService,
    private awsService: AwsService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private smService: SmService,
  ) {}

  @UseInterceptors(OrderValidateInterceptor)
  @Override('createOneBase')
  async createOne(@Req() req, @ParsedBody() dto: CreateParcelDto) {
    return await this.service.createCn(req, dto);
  }

  @Get('getLabel/:trackingNumber/:labelFormat')
  async getLabel(@Param('trackingNumber') trackingNumber: string, @Param('labelFormat') labelFormat: string) {
    const parcel = await this.service.findOne({
      where: {
        trackingNumber,
      },
    });
    if (!parcel) {
      throw new BadRequestException(`FTL: parcel(${trackingNumber}) not found`);
    }
    const config: IChannelConfig = await this.service._getChannelConfig({ code: parcel.channel });
    const accountInfo = config.accountInfo;
    const labelFormatObj = config.labelFormats.find(label => label.code === labelFormat);
    return await this.service.getLabel(parcel.transporter, trackingNumber, accountInfo, labelFormatObj);
  }

  /**
   * TODO 兼容v1
   */
  @Post('cancelShipment')
  async cancelParcel(@Body() dto: CancelParcelDto) {
    return this.service.cancelParcel(dto);
  }

  @Post('clearCache')
  async clearAllCache() {
    await this.service.clearAllCache();
  }

  /**
   * 获取面单文件url
   * @param body
   */
  @Post('getLabelUrls')
  async getLabelUrls(@Body() body: { trackingNumbers: string[] }) {
    return await this.service.getLabelUrls(body.trackingNumbers);
  }

  @Post('execute')
  async execute(@Body() body) {
    const { logId, executorHandler } = body;
    await this.service[executorHandler]();
    Logger.info(`Method: ${executorHandler} success !!!`);
    this.smService
      .callback({
        status: STATE.SUCCESS,
        message: 'success',
        logId,
        success: JOB_SUCCESS.SUCCESS,
      })
      .then(() => Logger.info('缓存更新回调成功'));
    return {
      logId,
      success: JOB_SUCCESS.SUCCESS,
      jobGroupName: 'CMS-API-CN',
      jobInfoName: executorHandler,
    };
  }
}
