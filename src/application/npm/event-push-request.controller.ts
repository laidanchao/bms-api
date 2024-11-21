import { Crud, Override } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { EventPushRequestService } from '../../domain/npm/event-push/service/event-push-request.service';
import { EventPushRequest } from '@/domain/npm/event-push/entity/event-push-request.entity';
import { User, UserDto } from '@/app/decorators/user.decorator';

@Crud({
  model: {
    type: EventPushRequest,
  },
})
@ApiBearerAuth()
@ApiTags('EventPushRequest')
@Controller('/api/cms/eventPushRequest')
export class EventPushRequestController {
  @Inject()
  private service: EventPushRequestService;

  @Override('createOneBase')
  async createOne(@Body() body: EventPushRequest, @User() user: UserDto) {
    return await this.service.create(body, user);
  }
}
