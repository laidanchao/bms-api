import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Inject } from '@nestjs/common';
import { WebhookSetting } from '@/domain/sct/webhook/entity/webhook-setting.entity';
import { WebhookSettingService } from '@/domain/sct/webhook/service/webhook-setting.service';

@Crud({
  model: {
    type: WebhookSetting,
  },
  query: {},
})
@ApiBearerAuth()
@ApiTags('WebhookSetting')
@Controller('/api/cms/webhookSetting')
export class WebhookSettingController {
  @Inject()
  private service: WebhookSettingService;
}
