import { Controller, Get, Param } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateZoneDto, UpdateZoneDto } from '@/domain/sci/transporter-zone/dto';
import { TransporterZoneService } from '@/domain/sci/transporter-zone/transporter-zone.service';
import { TransporterZone } from '@/domain/sci/transporter-zone/entity/transporter-zone.entity';
import { Transporter } from '@/domain/utils/Enums';

@Crud({
  model: {
    type: TransporterZone,
  },
  dto: {
    create: CreateZoneDto,
    replace: UpdateZoneDto,
  },
})
@ApiBearerAuth()
@ApiTags('transporterZone')
@Controller('/api/cms/transporterZone')
export class TransporterZoneController {
  constructor(private readonly service: TransporterZoneService) {}

  @Get('findAllByTransporter/:transporter')
  public async findAll(@Param('transporter') transporter: Transporter) {
    return await this.service.findAll(transporter);
  }

  /**
   * oms 根据线路获取生效邮编
   * @param route
   * @param transporter
   */

  @Get('findByRoute/:route/:transporter?')
  async findByRoute(@Param('route') route: string, @Param('transporter') transporter: string) {
    return await this.service.findByRoute(route, transporter);
  }
}
