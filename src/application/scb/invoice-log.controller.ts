import { Crud } from '@nestjsx/crud';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoiceLog } from '@/domain/scb/invoice-log/entities/invoice-log.entity';
import { InvoiceLogService } from '@/domain/scb/invoice-log/invoice-log.service';

@Crud({
  model: {
    type: InvoiceLog,
  },
  query: {
    alwaysPaginate: false,
  },
})
@ApiTags('invoiceLog')
@Controller('/api/cms/invoiceLog')
export class InvoiceLogController {
  constructor(private readonly service: InvoiceLogService) {}

  /**
   * 根据invoiceId 删除bill
   * for 重新解析删除之前的账单记录
   * @param invoiceId
   */
  @Delete('byInvoiceId/:invoiceId')
  public async deleteBillLogByInvoiceId(@Param('invoiceId') invoiceId: number) {
    return await this.service.deleteByInvoiceId(invoiceId);
  }
}
