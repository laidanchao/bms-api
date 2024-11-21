import { CreateLabelFormatDto } from '@/domain/sci/transporter/dto/create-label-format.dto';
import { CreateTransporterAccountDto } from '@/domain/sci/transporter/dto/create-transporter-account.dto';
import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { dto } from '@/domain/sci/transporter/dto';
import { SaveTransporterProductDto } from '@/domain/sci/transporter/dto/save-transporter-product';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { TransporterService } from '@/domain/sci/transporter/service/transporter.service';

@Crud({
  model: {
    type: Transporter,
  },
  dto,
  query: {
    join: {
      transporterProducts: {},
      'transporterProducts.channels': {},
      transporterAccounts: {},
      'transporterAccounts.channels': {},
      labelFormats: {},
    },
    alwaysPaginate: false,
  },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
})
@Controller('/api/cms/transporter')
@ApiTags('transporter')
@ApiBearerAuth()
export class TransporterController {
  constructor(private readonly service: TransporterService) {}

  // TODO danchao 前端未能以服务商未视角进入,导致其他实体需要通过单独的api查询.
  @Get('productCode')
  getProductCode(@Request() req, @Query() { ftlRoute }) {
    return this.service.getProductCode(ftlRoute);
  }

  @Get('account')
  getAccount(@Query() query) {
    return this.service.getAccount(query);
  }

  @Post('updateTransporter')
  updateTransporter(@Body() body) {
    return this.service.updateTransporter(body);
  }

  @Post('saveTransporter')
  saveTransporter(@Body() body) {
    return this.service.saveTransporter(body);
  }

  @Get('product')
  getProduct() {
    return this.service.getProduct();
  }

  @Get('labelFormats')
  getLabelFormats(@Query() query) {
    return this.service.getLabelFormats(query);
  }

  @Post('product')
  saveProduct(@Request() req, @Body() product: SaveTransporterProductDto) {
    return this.service.saveProduct(product);
  }

  @Post('account')
  saveAccount(@Body() account: CreateTransporterAccountDto) {
    return this.service.saveAccount(account);
  }

  @Post('labelFormat')
  saveLabelFormat(@Body() labelFormat: CreateLabelFormatDto) {
    return this.service.saveLabelFormat(labelFormat);
  }

  @Get('label/signedExampleUrl/:id')
  async getSignedLabelExampleUrl(@Param('id') id) {
    return await this.service.getSignedLabelExampleUrl(id);
  }

  /**
   * oms 获取所有尾程派送商
   */
  @Get('oms/getLastmileProviders')
  async getLastmileProviders() {
    return await this.service.getLastmileProviders();
  }
}
