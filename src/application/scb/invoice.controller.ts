import { ScbInvoiceService } from '@/domain/scb/invoice/invoice.service';
import { Crud } from '@nestjsx/crud';
import { ScbInvoice } from '@/domain/scb/invoice/entities/invoice.entity';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateScbInvoiceDto } from '@/domain/scb/invoice/dto/create-scb-invoice.dto';

@Crud({
  model: {
    type: ScbInvoice,
  },
  query: {
    alwaysPaginate: false,
  },
})
@ApiTags('scbInvoice')
@Controller('/api/cms/scbInvoice')
export class ScbInvoiceController {
  constructor(private readonly service: ScbInvoiceService) {}

  /**
   * 其他账单开始解析
   * @param body
   */
  @Post('startParseInvoice')
  async startParseInvoice(@Body() body: CreateScbInvoiceDto) {
    await this.service.parseInvoice(body);
  }

  /**
   * 额外费确认
   * 法邮账单开始解析
   * @param body
   */
  @Post('startParseCMInvoice')
  async startParseCMInvoice(@Body() body: { id: number }) {
    return await this.service.startParseCMInvoice(body.id);
  }

  /**
   * 重新解析
   * @param body
   */
  @Post('reResolveInvoice')
  async reResolveInvoice(@Body() body) {
    await this.service.reResolveInvoice(body.id, body.operator);
  }

  /**
   * 通知oms 可以开始出账
   */
  @Post('notifyInvoiceOms')
  async notifyInvoiceOms(@Body() body) {
    return await this.service.notifyInvoiceOms(body.month, body.transporter, body.billType, body.operator);
  }

  /**
   * 更新invoice 状态
   */

  @Post('updateStatus')
  public async updateInvoiceTaskStatus(@Body() body) {
    return await this.service.updateInvoiceStatus(body.name, body.status, body.reason);
  }

  /**
   * 账单根据平台（platform）拆分
   * @param file
   * @param body
   */
  @Post('splitInvoice')
  async splitInvoice(@Body() body: { transporter: string; filePath: string; saveRootPath: string }) {
    return await this.service.splitInvoice(body.transporter, body.filePath, body.saveRootPath);
  }

  // todo new

  @Post('download')
  async downloadInvoice(@Body() body: Record<string, string>) {
    return await this.service.downloadInvoice(body['path']);
  }

  // /**
  //  * 重新上传源账单
  //  */
  // @Post('reUploadBill')
  // async reUploadBill(@Body() body) {
  //   return await this.service.reUploadBill(body);
  // }

  /**
   * 解析开始
   * 找到对应的invoice
   * @param wheres
   */
  @Get('findInvoice')
  public async findInvoice(@Query('wheres') wheres) {
    return await this.service.findOne(JSON.parse(wheres));
  }
}
