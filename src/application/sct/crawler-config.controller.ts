import { Controller, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { CrawlerConfigService } from '@/domain/sct/crawler/service/crawler-config.service';
import { CrudAcl } from '@/app/decorators';

@Crud({
  model: {
    type: CrawlerConfig,
  },
})
@CrudAcl({
  persist: user => {
    return {
      operator: user.username,
    };
  },
})
@ApiBearerAuth()
@ApiTags('crawlerConfig')
@Controller('/api/cms/crawlerConfig')
export class CrawlerConfigController {
  @Inject()
  service: CrawlerConfigService;
}
