import { ApiBearerAuth } from '@nestjs/swagger';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { CrawlerService } from '@/domain/sct/crawler/service/crawler.service';

@ApiBearerAuth()
@Controller('/api/cms/crawler')
export class CrawlerController {
  @Inject()
  private service: CrawlerService;

  @Post('addToCrawlList')
  async addToCrawlList(@Body() body: { trackingNumbers: string[]; sort: number }) {
    return await this.service.addToCrawlList(body.trackingNumbers, body.sort);
  }

  @Get('getTrackingNumbers')
  async getTrackingNumbers(@Query() query: { limit: number }) {
    return await this.service.getTrackingNumbers(query.limit);
  }

  @Post('saveTracking')
  async saveTracking(@Body() body) {
    return await this.service.saveTracking(body);
  }
}
