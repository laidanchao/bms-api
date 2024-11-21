import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventPushTask } from '@/domain/npm/event-push/entity/event-push-task.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventPushTaskService } from '@/domain/npm/event-push/service/event-push-task.service';
import { User, UserDto } from '@/app/decorators/user.decorator';
import { ClsService } from 'nestjs-cls';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';

@Crud({
  model: {
    type: EventPushTask,
  },
  query: {
    join: {
      details: {},
    },
  },
})
@ApiTags('EventPushTask')
@Controller('/api/cms/eventPushTask')
@ApiBearerAuth()
export class EventPushTaskController {
  constructor(private readonly service: EventPushTaskService, private readonly cls: ClsService) {}

  @Post('/bulkInsert')
  @UseInterceptors(FileInterceptor('file'))
  async bulkInsert(@UploadedFile() file, @User() user: UserDto) {
    return await this.service.bulkInsert(file, user);
  }

  @Post('/findList')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM, PermissionTypeEnum.CLIENT]))
  async findList(@Body() body) {
    const platform = this.cls.get('platform');
    const client = this.cls.get('client');
    body.platform = platform;
    body.client = client;
    return await this.service.findList(body);
  }
}
