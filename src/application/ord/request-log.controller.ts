import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestLogService } from '@/domain/ord/request-log/request-log.service';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
@Crud({
  model: {
    type: RequestLog,
  },
})
@ApiBearerAuth()
@ApiTags('request-log')
@Controller('/api/cms/request-log')
export class RequestLogController {
  constructor(private readonly service: RequestLogService) {}
}
