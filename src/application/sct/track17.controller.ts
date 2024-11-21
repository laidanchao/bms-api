import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';
import { Track17Service } from '@/domain/sct/webhook/service/track17.service';

@Crud({
  model: {
    type: Track17,
  },
  query: {
    join: {
      track17Account: {},
    },
  },
})
@ApiBearerAuth()
@ApiTags('Track17')
@Controller('/api/cms/track17')
export class Track17Controller {
  @Inject()
  private service: Track17Service;
}
