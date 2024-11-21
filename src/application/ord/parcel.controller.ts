import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Crud, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParcelService } from '@/domain/ord/parcel/service/parcel.service';
import {
  CancelParcelDto,
  CreateMultiParcelResponse,
  CreateParcelDto,
  QueryTrackingDto,
  UpdateParcelDto,
  UploadEtdFileDto,
} from '@/domain/ord/parcel/dto';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { CrudAcl } from '@/app/decorators';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import _ from 'lodash';
import { OrderValidateInterceptor } from '@/app/interceptors/order-validate.interceptor';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import { ShipmentInfoDto } from '@/domain/ord/parcel/dto/shipment-info.dto';
import { OutsideParcelDto } from '@/domain/ord/parcel/dto/outside-parcel.dto';
import { BusinessException } from '@/app/exception/business-exception';
import { RelayPointDTO } from '@/domain/sci/transporter/broker/mr/mr.constraint';
import { In } from 'typeorm';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { OutsideExternalParcelDto } from '@/domain/ord/parcel/dto/outside-external-parcel.dto';
import { ClsService } from 'nestjs-cls';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { OmsService } from '@/domain/external/oms/oms.service';

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
    replace: UpdateParcelDto,
  },
  routes: {
    exclude: ['deleteOneBase', 'replaceOneBase', 'createManyBase'],
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
export class ParcelController {
  constructor(
    private readonly service: ParcelService,
    private readonly extendService: ParcelExtendService,
    private readonly cls: ClsService,
    private readonly omsService: OmsService,
  ) {}

  // TODO weifeng 重构:
  //  1.异步上传文件到S3
  //  2.减少try catch代码块
  //  3.优化获取渠道的方法, 尽量少连接数据库
  //  4.耗时代码块提前使用promise去处理, 等到需要promise返回值时, 才使用await获取结果.
  @UseInterceptors(OrderValidateInterceptor)
  @Override('createOneBase')
  async createOne(@ParsedRequest() req: CrudRequest, @ParsedBody() dto: CreateParcelDto) {
    const result: CreateMultiParcelResponse = await this.service.create(req, dto);
    if (result.parcelId) {
      this.service._uploadLabelToS3(result, dto.options).then();
      this.service._uploadInvoiceToS3(result, dto.options).then();
    }

    return {
      ..._.omit(result, ['parcelId']),
      parcels: _.map(result.parcels, parcel => _.omit(parcel, 'parcelId')),
    };
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
   * 上传电子清关文件
   * 暂时只有fedex在用
   */
  @Post('uploadEtdFile')
  uploadEtdFile(@Body() dto: UploadEtdFileDto) {
    return this.service.uploadEtdFile(dto);
  }

  @Put('modifyShipment')
  async modifyShipment(@Body() dto: CreateParcelDto) {
    return await this.service.modifyShipment(dto);
  }

  /**
   * TODO 兼容v1
   */
  @Post('cancelShipment')
  async cancelParcel(@Body() dto: CancelParcelDto) {
    return this.service.cancelParcel(dto);
  }

  @Post('pickup')
  async pickup(@Body() dto: CreatePickupDto) {
    return this.service.schedulePickup(dto);
  }

  @Post('cancelPickup')
  async cancelPickup(@Body() dto) {
    return this.service.cancelPickup(dto);
  }

  @Get('findParcels')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async findParcels(@Query() query) {
    const platform = this.cls.get('platform');
    const client = this.cls.get('client');
    if (!_.isEmpty(query.trackingNumbers)) {
      if (!Array.isArray(query.trackingNumbers)) {
        query.trackingNumbers = [query.trackingNumbers];
      }
      query.platform = platform;
      query.clientId = client;
      return await this.service.findParcels(query);
    }
    return [];
  }

  @Post('findParcels')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async getParcels(@Body() body) {
    const platform = this.cls.get('platform');
    const client = this.cls.get('client');
    if (_.isEmpty(body.trackingNumbers)) {
      return [];
    }
    body.platform = platform;
    body.clientId = client;
    return await this.service.findParcels(body);
  }

  @Get('findParcelsAndTrackings')
  async findParcelsAndTrackings(@Query() query) {
    if (!_.isEmpty(query.trackingNumbers)) {
      if (!Array.isArray(query.trackingNumbers)) {
        query.trackingNumbers = [query.trackingNumbers];
      }
      // todo delete applicationToPlatform
      query.platform = query?.platform || query?.application;
      return await this.service.findParcelsAndTrackings(query);
    }
    return [];
  }

  /**
   * get请求有字符限制，所以添加一个post接口
   * @param body
   */
  @Post('findParcelsAndTrackings')
  async getParcelsAndTrackings(@Body() body) {
    if (!_.isEmpty(body.trackingNumbers)) {
      if (!Array.isArray(body.trackingNumbers)) {
        body.trackingNumbers = [body.trackingNumbers];
      }
      // todo delete applicationToPlatform
      body.platform = body?.platform || body?.application;
      return await this.service.findParcelsAndTrackings(body);
    }
    return [];
  }

  @Post('findParcelTrackings')
  async findParcelTrackings(@Body() body) {
    if (!_.isEmpty(body.trackingNumbers)) {
      if (!Array.isArray(body.trackingNumbers)) {
        body.trackingNumbers = [body.trackingNumbers];
      }
      return await this.service.findParcelTrackings(body);
    }
    return [];
  }

  @Get(':trackingNumber/trackings')
  async getTraces(@Param('trackingNumber') trackingNumber: string, @Query() query: QueryTrackingDto) {
    return this.service.getTrackings(trackingNumber, query);
  }

  /**
   * TODO 目前只有DHL在使用这个接口 暂时定义返回结构为
     [
         {
              "serviceType": "C",
              "currency": "EUR",
              "amount": "317.51"
          },
         {
              "serviceType": "I",
              "currency": "EUR",
              "amount": "72.59"
          }
     ]
   * @param dto
   */
  @Post('rate')
  async getShipmentRate(@Body() dto: CreateParcelDto) {
    const result = await this.service.getShipmentRate(dto);
    if (result) {
      return {
        serviceType: result.attributes.type,
        currency: result.TotalNet[0].Currency,
        amount: result.TotalNet[0].Amount,
        charges: result.Charges[0].Charge,
      };
    }
    return result;
  }

  @Post('searchOrderInfo')
  async searchOrderInfo(@Body() shipmentInfos: ShipmentInfoDto[]) {
    return await this.service.searchOrderInfo(shipmentInfos);
  }

  @Post('searchRelayPointLocation')
  async searchRelayPointLocation(@Body() relayPointDTO: RelayPointDTO) {
    return await this.service.searchRelayPointLocation(relayPointDTO);
  }

  @Post('outside')
  async saveOutsideParcel(@Body() outsideParcelArray: OutsideParcelDto[]) {
    if (!outsideParcelArray || !outsideParcelArray.length) {
      throw new BusinessException('参数校验未通过');
    }
    outsideParcelArray.forEach(outsideParcel => {
      if (!outsideParcel.trackingNumber || !outsideParcel.shippingNumber || !outsideParcel.channel) {
        throw new BusinessException('参数校验未通过');
      }
    });
    return await this.extendService.saveOutsideParcel(outsideParcelArray);
  }

  @Post('import')
  async saveOutsideParcelNew(@Body() body: { platform: string; parcels: OutsideExternalParcelDto[] }) {
    const { platform, parcels } = body;
    if (!platform) {
      throw new BusinessException('平台不能为空');
    }
    if (_.isEmpty(parcels)) {
      throw new BusinessException('包裹不能为空');
    }

    if (!parcels.every(e => e.trackingNumber && e.shippingNumber && e.lastmileProvider)) {
      throw new BusinessException('trackingNumber,shippingNumber,lastmileProvider is required');
    }

    return await this.extendService.saveOutsideExternalParcel(parcels, platform);
  }

  @Post('clearCache')
  async clearAllCache() {
    await this.service.clearAllCache();
    await this.service.setNacosConfig();
  }

  /**
   * 获取需要导出的包裹信息
   * @param body
   */
  @Post('getExportParcels')
  async getExportParcels(@Body() body: string[]) {
    return this.service.getExportParcels(body);
  }

  /**
   * 批量查询包裹(分页)
   * @param body 查询条件/分页参数
   */
  @Post('findListByTrackingNumbers')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async findListByTrackingNumbers(@Body() body: pageParamsType) {
    const platform = this.cls.get('platform');
    const client = this.cls.get('client');
    return this.service.findListByTrackingNumbers(body, platform, client);
  }

  /**
   * 根据条件查询包裹数量
   * @param body
   */
  @Post('getCountByCondition')
  async getCountByCondition(@Body() body: string[]) {
    return this.service.getCountByCondition(body);
  }

  /**
   * 获取面单文件url
   * @param body
   */
  @Post('getLabelUrls')
  async getLabelUrls(@Body() body: { trackingNumbers: string[] }) {
    return await this.service.getLabelUrls(body.trackingNumbers);
  }

  /**
   * 获取面单信息
   * @param body
   */
  @Post('getLabels')
  async getLabels(@Body() body: { codes: string[] }) {
    return await this.service.getLabels(body.codes);
  }

  @Post('findTrackingNumberByShippingNumber')
  public async findTrackingNumberByShippingNumber(@Body() body) {
    return await this.service.find({
      select: ['trackingNumber', 'shippingNumber'],
      where: {
        shippingNumber: In(body.shippingNumber),
      },
    });
  }

  @Post('pushToSMS')
  public async pushToSMS(@Body() body: { platform?: string; trackingNumbers: string[] }) {
    return await this.service.pushToSMS(body.trackingNumbers, body.platform);
  }

  /**
   * 从一批单号中筛选出：通过FTL账号下单的单号
   * @param body
   */
  @Post('getFTLParcels')
  async getFTLParcels(@Body() body: string[]) {
    return await this.service.getFTLParcels(body);
  }

  /**
   * 获取OMS客户列表
   */
  @Get('getOmsClients')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async getOmsClients() {
    const client = this.cls.get('client');
    const result = await this.omsService.getClients();
    if (client) {
      return result.filter(f => f.id === client);
    } else {
      return result;
    }
  }
}
