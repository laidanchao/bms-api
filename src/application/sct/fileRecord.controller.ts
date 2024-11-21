import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { FileRecordService } from '@/domain/sct/file/service/file-record.service';
import { FileRecord } from '@/domain/sct/file/entity/file-record.entity';

@Crud({
  model: {
    type: FileRecord,
  },
})
@ApiBearerAuth()
@ApiTags('FileRecord')
@Controller('/api/cms/fileRecord')
export class FileRecordController {
  constructor(private readonly service: FileRecordService) {}

  @Post('download')
  async downloadTracking(@Body() body: Record<string, string>) {
    return await this.service.downloadTracking(body['path']);
  }
}
