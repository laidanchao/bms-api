import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { Track17Event } from '@/domain/sct/webhook/entity/track17-event.entity';
import { Track17EventService } from '@/domain/sct/core/service/track17-event.service';

@Crud({
  model: {
    type: Track17Event,
  },
})
@ApiBearerAuth()
@ApiTags('Track17Event')
@Controller('/api/cms/track17Event')
export class Track17EventController {
  @Inject()
  private service: Track17EventService;
}
