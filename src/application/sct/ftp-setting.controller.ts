import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { FtpSettingService } from '@/domain/sct/file/service/ftp-setting.service';
import { FtpSetting } from '@/domain/sct/file/entity/ftp-setting.entity';

@Crud({
  model: {
    type: FtpSetting,
  },
  query: {
    sort: [
      {
        field: 'enabled',
        order: 'DESC',
      },
    ],
  },
})
@Controller('/api/cms/ftpSetting')
@ApiTags('ftpSetting')
@ApiBearerAuth()
export class FtpSettingController {
  constructor(private readonly service: FtpSettingService) {
  }
}
