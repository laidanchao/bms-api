import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { LastmileProviderService } from '@/domain/sci/lastmile-provider/service/lastmile-provider.service';
import { LastmileProvider } from '@/domain/sci/lastmile-provider/entity/lastmile-provider.entity';

@Crud({
  model: {
    type: LastmileProvider,
  },
  query: {},
})
@Controller('/api/cms/lastmileProvider')
@ApiTags('lastmileProvider')
@ApiBearerAuth()
export class LastmileProviderController {
  constructor(private readonly service: LastmileProviderService) {}

  @Get('getList')
  async getList() {
    const result = await this.service.find({
      select: ['lastmileProvider'],
    });

    return result.map(m => m.lastmileProvider);
  }
}
