import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { LabelFormatService } from '@/domain/sci/transporter/service/label-format.service';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';

@Crud({
  model: {
    type: LabelFormat,
  },
  routes: {
    exclude: ['deleteOneBase'],
  },
})
@Controller('/api/cms/labelFormat')
@ApiTags('labelFormat')
@ApiBearerAuth()
export class LabelFormatController {
  constructor(private readonly service: LabelFormatService) {}
}
