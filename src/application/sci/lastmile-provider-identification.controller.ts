import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { LastmileProviderIdentification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-identification.entity';
import { LastmileProviderIdentificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-identification.service';

@Crud({
  model: {
    type: LastmileProviderIdentification,
  },
  query: {},
})
@Controller('/api/cms/lastmileProviderIdentification')
@ApiTags('lastmileProviderIdentification')
@ApiBearerAuth()
export class LastmileProviderIdentificationController {
  constructor(private readonly service: LastmileProviderIdentificationService) {}

  @Get('getAllProvider')
  async getAllProvider() {
    return this.service.getAllProvider();
  }
}
