import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, ParseArrayPipe, Query } from '@nestjs/common';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { In } from 'typeorm';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';

@Crud({
  model: {
    type: CrawlerTarget,
  },
})
@ApiBearerAuth()
@ApiTags('CrawlerTarget')
@Controller('/api/cms/crawlerTarget')
export class CrawlerTargetController {
  @Inject()
  private service: CrawlerTargetService;

  @Get('findByTrackingNumber')
  public async findByTrackingNumber(@Query('trackingNumbers', new ParseArrayPipe({ optional: true })) trackingNumbers) {
    if (!trackingNumbers || !trackingNumbers.length) {
      return [];
    }
    return await this.service.find({
      where: {
        trackingNumber: In(trackingNumbers),
      },
    });
  }
}
