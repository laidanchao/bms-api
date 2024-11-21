import { Crud } from '@nestjsx/crud';
import { Event } from '@/domain/sct/core/entity/event.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { EventService } from '@/domain/sct/core/service/event.service';

@Crud({
  model: {
    type: Event,
  },
})
@ApiBearerAuth()
@ApiTags('Event')
@Controller('/api/cms/event')
export class EventController {
  @Inject()
  private service: EventService;
}
