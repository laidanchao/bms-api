import { Module } from '@nestjs/common';
import { CoreModule } from '@/domain/sct/core/core.module';
import { CrawlerModule } from '@/domain/sct/crawler/crawler.module';
import { FileModule } from '@/domain/sct/file/file.module';
import { WebhookModule } from '@/domain/sct/webhook/webhook.module';

@Module({
  imports: [CoreModule, CrawlerModule, FileModule, WebhookModule],
  exports: [CoreModule, CrawlerModule, FileModule, WebhookModule],
})
export class SctModule {}
