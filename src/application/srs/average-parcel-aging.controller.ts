import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, ParseArrayPipe, Query, UseGuards } from '@nestjs/common';
import { AverageParcelAging } from '@/domain/srs/average-parcel-aging/entities/average-parcel-aging.entity';
import { AverageParcelAgingService } from '@/domain/srs/average-parcel-aging/service/average-parcel-aging.service';
import moment from 'moment';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: AverageParcelAging,
  },
})
@ApiBearerAuth()
@ApiTags('average-parcel-aging')
@Controller('/api/cms/averageParcelAging')
export class AverageParcelAgingController {
  constructor(private readonly service: AverageParcelAgingService, private readonly cls: ClsService) {}

  @Get('analysis/data')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  async fetchAnalysisData(@Query('wheres') wheres: Record<string, string>) {
    if (!wheres || (!wheres.startDate && !wheres.endDate)) {
      wheres = {};
      wheres.startDate = moment()
        .utc()
        .add(-7, 'days')
        .format('YYYY-MM-DD');
      wheres.endDate = moment()
        .utc()
        .format('YYYY-MM-DD');
    } else if (!wheres.startDate) {
      wheres.startDate = moment(wheres.endDate, 'YYYY-MM-DD')
        .utc()
        .add(-7, 'days')
        .format('YYYY-MM-DD');
    } else if (!wheres.endDate) {
      wheres.endDate = moment(wheres.startDate, 'YYYY-MM-DD')
        .utc()
        .add(7, 'days')
        .format('YYYY-MM-DD');
    }

    const platform = this.cls.get('platform');
    if (platform) {
      wheres['platform'] = platform;
    }
    return await this.service.fetchAnalysisData(wheres);
  }

  @Get('analysis/menu')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  async fetchAnalysisMenu(@Query('keys', new ParseArrayPipe({ optional: true })) keys: string[]) {
    return await this.service.fetchAnalysisMenu(keys);
  }
}
