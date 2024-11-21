import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { BillDetailService } from '@/domain/scb/bill/service/bill-detail.service';

@Crud({
  model: {
    type: BillDetail,
  },
  query: {
    alwaysPaginate: false,
  },
})
@ApiTags('billDetail')
@Controller('/api/cms/billDetail')
export class BillDetailController {
  constructor(private readonly service: BillDetailService) {}
  @Get('getUpsPurchaseDetail/:month/:transporterAccountId')
  public async fetchUpsBillDetailForEsendeo(
    @Param('month') month: string,
    @Param('transporterAccountId') transporterAccountId: string,
  ): Promise<BillDetail[]> {
    return await this.service.esendeoUps(month, transporterAccountId);
  }
}
