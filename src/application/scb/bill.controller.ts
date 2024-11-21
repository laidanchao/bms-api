import { BillService } from '@/domain/scb/bill/service/bill.service';
import { BadRequestException, Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import { getRepository } from 'typeorm';
import { Account } from '@/domain/cam/account/entities/account.entity';

@Crud({
  model: {
    type: Bill,
  },
  query: {
    join: {
      extraFees: { eager: true },
    },
    alwaysPaginate: false,
  },
})
@ApiTags('bill')
@Controller('/api/cms/bill')
export class BillController {
  constructor(private readonly service: BillService) {}

  @Get('analysis/data')
  fetchAnalysisData(@Query('target') target: string, @Query('wheres') wheres: Record<string, string>) {
    return this.service.fetchAnalysisData(target, wheres);
  }

  @Get('amount/analysis/menu')
  fetchAmountAnalysisMenu(@Query('keys', new ParseArrayPipe({ optional: true })) keys: string[]) {
    return this.service.fetchAmountAnalysisMenu(keys);
  }

  @Get('extraFee/analysis/data')
  fetchExtraFeeAnalysisData(@Query('target') target: string, @Query('wheres') wheres: Record<string, string>) {
    return this.service.fetchExtraFeeAnalysisData(target, wheres);
  }

  @Get('extraFee/analysis/menu')
  fetchExtraFeeAnalysisMenu(@Query('keys', new ParseArrayPipe({ optional: true })) keys: string[]) {
    return this.service.fetchExtraFeeAnalysisMenu(keys);
  }

  @Get('extraFee/detail')
  async fetchExtraFeeDataDetail(@Query('wheres') wheres: Record<string, string>) {
    if (!wheres.transporterAccountId) {
      throw new BadRequestException('请先选择供应商账号');
    }
    return await this.service.fetchExtraFeeDataDetail(wheres);
  }

  @Get('bms/:month/:transporterId/:transporterAccountId')
  public async fetchDataForBMS(
    @Param('month') month: string,
    @Param('transporterId') transporterId: string,
    @Param('transporterAccountId') transporterAccountId: string,
  ): Promise<Bill[]> {
    return await this.service.bms(month, transporterId, transporterAccountId);
  }

  /**
   * 根据invoiceId 删除bill
   * for 重新解析删除之前的账单记录
   * @param invoiceId
   */
  @Delete('byInvoiceId/:invoiceId')
  public async deleteBillByInvoiceId(@Param('invoiceId') invoiceId: number) {
    return await this.service.deleteByInvoiceId(invoiceId);
  }

  /**
   * parquet获取billId
   */
  @Get('findBillId')
  async getBillId(@Query('wheres') wheres) {
    return await this.service.findOne(JSON.parse(wheres));
  }

  /**
   * 保存账单
   * @param bill
   */
  @Post('saveBill')
  public async savePurchaseBill(@Body() bill) {
    if (bill.transporterId === 'COLISSIMO') {
      const account = await getRepository(Account).findOne({
        where: {
          account: bill.transporterAccountId,
        },
      });
      bill.platform = account.platform;
    }

    const resultBill = await this.service.saveServerlessPurchaseBill(bill);
    return { billId: resultBill.id, platform: bill.platform };
  }

  /**
   * 更新fileForApplication
   */

  @Post('updateFileForApp')
  public async updateFileForApplication(@Body() body) {
    return await this.service.updateFileForApplication(body.fileForApplication, body.sourceFileName);
  }

  @Post('handleScbServerlessResult')
  public async handleScbServerlessResult(@Body() body) {
    return await this.service.handleScbServerlessResult(body);
  }

  @Get('getBillByMonth')
  async getBillByMonth(
    @Query('transporterId') transporterId: string,
    @Query('startMonth') startMonth: string,
    @Query('endMonth') endMonth: string,
  ) {
    return await this.service.getBillByMonth(transporterId, startMonth, endMonth);
  }
}
