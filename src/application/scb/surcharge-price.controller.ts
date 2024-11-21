import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { SurchargePrice } from '@/domain/scb/surcharge-price/entities/surcharge-price.entity';
import { SurchargePriceService } from '@/domain/scb/surcharge-price/surcharge-price.service';

@Crud({
  model: {
    type: SurchargePrice,
  },
  query: {
    sort: [
      { field: 'month', order: 'DESC' },
      { field: 'id', order: 'DESC' },
    ],
  },
})
@ApiTags('surchargePrice')
@Controller('/api/cms/surchargePrice')
export class SurchargePriceController {
  @Inject()
  private readonly service: SurchargePriceService;

  @Get('getPrice')
  async getSurchargePrice(@Query('month') month) {
    return this.service.getSurchargePrice(month);
  }
}
