import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { EventStatusDesc } from '@/domain/sct/core/entity/eventStatusDesc.entity';
import { EventStatusDescService } from '@/domain/sct/core/service/eventStatusDesc.service';

@Crud({
  model: {
    type: EventStatusDesc,
  },
})
@ApiBearerAuth()
@ApiTags('EventStatusDesc')
@Controller('/api/cms/eventStatusDesc')
export class eventStatusDescController {
  @Inject()
  private service: EventStatusDescService;
}
