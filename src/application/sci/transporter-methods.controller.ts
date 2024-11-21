import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';
import { TransporterMethods } from '../../domain/sci/transporter-method/transporter-methods.entity';
import { TransporterMethodsService } from '../../domain/sci/transporter-method/transporter-methods.service';

@Crud({
  model: {
    type: TransporterMethods,
  },
})
@ApiTags('transporterMethods')
@Controller('/api/cms/transporterMethods')
export class TransporterMethodsController {
  constructor(private readonly service: TransporterMethodsService) {}
  @Get('/getAll')
  fetchAllData() {
    return this.service.fetchAllData();
  }
  @Get('/:transporter')
  fetchOne(@Param('transporter') transporter) {
    return this.service.find({ where: { transporter } });
  }
}
