import { QuantityDistribution } from '@/domain/srs/quantity-distribution/entities/quantity-distribution.entity';
import { Controller, Get, Inject, ParseArrayPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { QuantityDistributionService } from '@/domain/srs/quantity-distribution/service/quantity-distribution.service';
import { PermissionGuard } from '@/app/guards/permission.guard';
import { PermissionTypeEnum } from '@/domain/ord/parcel/enum/permissionType.enum';
import { ClsService } from 'nestjs-cls';

@Crud({
  model: {
    type: QuantityDistribution,
  },
})
@ApiBearerAuth()
@ApiTags('QuantityDistribution')
@Controller('/api/cms/quantityDistribution')
export class QuantityDistributionController {
  @Inject()
  private service: QuantityDistributionService;
  @Inject()
  private cls: ClsService;

  @Get('analysis/data')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  async fetchAnalysisData(@Query('wheres') wheres: Record<string, string>) {
    const platform = this.cls.get('platform');
    if (platform) {
      wheres['platform'] = platform;
    }
    return await this.service.fetchAnalysisData(wheres);
  }

  @Get('analysis/menu')
  @UseGuards(new PermissionGuard([PermissionTypeEnum.PLATFORM]))
  async fetchAnalysisMenu(@Query('keys', new ParseArrayPipe({ optional: true })) keys: string[]) {
    const platform = this.cls.get('platform');
    return await this.service.fetchAnalysisMenu(keys, platform);
  }

  @Get('analysis/menu/6G')
  async fetch6GAnalysisMenu(@Query('keys', new ParseArrayPipe({ optional: true })) keys: string[]) {
    return await this.service.fetch6GAnalysisMenu(keys);
  }
}
