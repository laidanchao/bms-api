import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';
import { TransporterApiService } from '@/domain/sci/transporter/service/transporter-api.service';
import { CreateTransporterApiDto } from '@/domain/sci/transporter/dto/create-transporter-api.dto';
import { UpdateTransporterApiDto } from '@/domain/sci/transporter/dto/update-transporter-api.dto';

@Crud({
  model: {
    type: TransporterApi,
  },
  dto: {
    create: CreateTransporterApiDto,
    replace: UpdateTransporterApiDto,
  },
  query: {
    sort: [
      {
        field: 'updatedAt',
        order: 'DESC',
      },
    ],
  },
})
@Controller('/api/cms/transporterApi')
@ApiTags('transporterApi')
@ApiBearerAuth()
export class TransporterApiController {
  constructor(private readonly service: TransporterApiService) {}
}
