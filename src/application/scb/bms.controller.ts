import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, Param, Req } from '@nestjs/common';
import { FuelRateService } from '@/domain/scb/fuel-rate/service/fuel-rate.service';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { BillService } from '@/domain/scb/bill/service/bill.service';
import moment from 'moment';
import { QuantityDistributionService } from '@/domain/srs/quantity-distribution/service/quantity-distribution.service';
import { BusinessException } from '@/app/exception/business-exception';

@ApiTags('bms')
@Controller('/api/cms/bms')
export class BmsController {
  @Inject()
  private readonly fuelRateService: FuelRateService;

  @Inject()
  private readonly billService: BillService;

  @Inject()
  private readonly quantityDistributionService: QuantityDistributionService;

  @Get('fuelRate/:month/:transporter')
  public async getFuelRate(@Param('month') month: string, @Param('transporter') transporter: string) {
    return this.fuelRateService.bms(month, transporter);
  }

  @Get('purchaseBill/:month/:transporterAccountId')
  public async getPurchaseBillByMonthAndAccount(
    @Param('month') month: string,
    @Param('transporterAccountId') transporterAccountId: string,
  ): Promise<Bill[]> {
    return await this.billService.find({
      where: {
        month,
        transporterAccountId,
      },
      relations: ['extraFees'],
    });
  }

  @Get('purchaseBill/:month/:transporterId/:transporterAccountId')
  public async getPurchaseBill(
    @Param('month') month: string,
    @Param('transporterId') transporterId: string,
    @Param('transporterAccountId') transporterAccountId: string,
  ): Promise<Bill[]> {
    return await this.billService.bms(month, transporterId, transporterAccountId);
  }

  @Get('getBillByMonthTransporter/:month/:transporterId/:billType')
  public async getBillByMonthTransporter(
    @Param('month') month: string,
    @Param('transporterId') transporterId: string,
    @Param('billType') billType: string,
    @Req() req,
  ): Promise<Bill[]> {
    if (!req.user.platform.id) {
      throw new BusinessException('token 未携带平台信息');
    }
    return await this.billService.bmsByMonthTransporter(month, transporterId, billType, req.user.platform.id);
  }

  @Get('parcelQuantity/:month/:transporter/:clientId')
  public async getParcelQuantity(
    @Param('month') month: string,
    @Param('transporter') transporter: string,
    @Param('clientId') clientId: string,
  ) {
    const startOfMonth = moment(month, 'YYYY-MM').startOf('month');
    const endOfMonth = moment(month, 'YYYY-MM').endOf('month');
    return await this.quantityDistributionService.findByDateAndTransporterAndClientId(
      startOfMonth,
      endOfMonth,
      transporter,
      clientId,
    );
  }
}
