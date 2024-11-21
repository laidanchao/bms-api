import { FuelRateService } from '@/domain/scb/fuel-rate/service/fuel-rate.service';
import { Crud } from '@nestjsx/crud';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Crud({
  model: {
    type: FuelRate,
  },
  query: {
    filter: {
      isDeleted: 'f',
    },
    sort: [
      { field: 'month', order: 'DESC' },
      { field: 'id', order: 'DESC' },
    ],
    alwaysPaginate: false,
  },
})
@ApiTags('fuelRate')
@Controller('/api/cms/fuelRate')
export class FuelRateController {
  constructor(private readonly service: FuelRateService) {}

  /**
   * 迁移至 BmsController
   * @param month
   * @param transporter
   */
  @Get('bms/:month/:transporter')
  public async fetchDataForBMS(
    @Param('month') month: string,
    @Param('transporter') transporter: string,
  ): Promise<FuelRate[]> {
    return this.service.bms(month, transporter);
  }

  @Get('getRate')
  public async findFuelRate(@Query('wheres') wheres) {
    return await this.service.find(JSON.parse(wheres));
  }
}
