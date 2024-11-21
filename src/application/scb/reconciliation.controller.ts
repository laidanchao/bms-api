import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { ReconciliationService } from '@/domain/scb/reconciliation/reconciliation.service';
import { ReconciliationTaskDto } from '@/domain/scb/reconciliation/dto/reconciliationTask.dto';
import { IgnoreToken } from '@/app/decorators';
import { Reconciliation } from '@/domain/scb/reconciliation/entities/reconciliation.entity';
import { Response } from 'express';

@Crud({
  model: {
    type: Reconciliation,
  },
  query: {
    sort: [{ field: 'id', order: 'DESC' }],
    join: {
      details: {},
    },
  },
})
@ApiTags('reconciliation')
@Controller('/api/cms/reconciliation')
export class ReconciliationController {
  constructor(private readonly service: ReconciliationService) {}

  /**
   * 创建对账任务
   * @param body
   */
  @Post('createReconcileTask')
  async createReconciliationTask(@Body() body: ReconciliationTaskDto) {
    return this.service.createReconcileTask(body);
  }

  /**
   * 获取生成的对账文件
   * @param param
   * @param res
   */
  @Get('file/:id')
  @IgnoreToken(true)
  async getFile(@Param() param: { id: number }, @Res() res: Response) {
    return await this.service.getFile(param.id, res);
  }
}
