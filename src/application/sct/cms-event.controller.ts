import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { CmsEvent } from '@/domain/sct/core/entity/cms-event.entity';
import { CmsEventService } from '@/domain/sct/core/service/cms-event.service';

@Crud({
  model: {
    type: CmsEvent,
  },
})
@ApiBearerAuth()
@ApiTags('CmsEvent')
@Controller('/api/cms/cmsEvent')
export class CmsEventController {
  @Inject()
  private service: CmsEventService;
}
