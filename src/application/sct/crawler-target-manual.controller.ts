import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CrawlerTargetManual } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { CrawlerTargetManualService } from '@/domain/sct/core/service/crawler-target-manual.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrawlerTargetManualDto } from '@/domain/sct/core/dto/crawler-target-manual.dto';

@Crud({
  model: {
    type: CrawlerTargetManual,
  },
})
@ApiBearerAuth()
@ApiTags('CrawlerTargetManual')
@Controller('/api/cms/crawlerTargetManual')
export class CrawlerTargetManualController {
  @Inject()
  private service: CrawlerTargetManualService;

  /**
   * 上传批量爬虫单号并校验数据
   * @param file
   */
  @Post('uploadManualTrackingFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadManualTrackingFile(@UploadedFile() file) {
    return await this.service.validAndUploadManualTrackingFile(file);
  }

  /**
   * 解析单次抓取轨迹的文件并抓取轨迹
   * @param body
   */
  @Post('parseManualFileAndCrawler')
  async parseManualFile(@Body() body) {
    return await this.service.handlerManualTracking(body);
  }

  /**
   * 获取READY状态的包裹数量
   */
  @Get('getReadyCount')
  async getReadyCount() {
    return await this.service.getReadyTrackingCount();
  }
}
