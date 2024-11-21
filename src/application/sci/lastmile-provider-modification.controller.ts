import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';
import { LastmileProviderModificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-modification.service';

@Crud({
  model: {
    type: LastmileProviderModification,
  },
  query: {},
})
@Controller('/api/cms/lastmileProviderModification')
@ApiTags('lastmileProviderModification')
@ApiBearerAuth()
export class LastmileProviderModificationController {
  constructor(private readonly service: LastmileProviderModificationService) {}

  // 包裹统计预览待修复包裹数
  @Get('getModifyParcel')
  async getModifyParcel(@Query() query) {
    return await this.service.getModifyParcel(query);
  }

  // 更新需要修正的数据
  @Post('editModifyStatus')
  async editModifyStatus(@Body('batchTimestamp') batchTimestamp) {
    await this.service.editModifyStatus(batchTimestamp);
  }
}
