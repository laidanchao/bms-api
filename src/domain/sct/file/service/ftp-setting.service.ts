import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FtpSetting } from '../entity/ftp-setting.entity';


@Injectable()
export class FtpSettingService extends TypeOrmCrudService<FtpSetting> {
  constructor(
    @InjectRepository(FtpSetting) repo,
  ) {
    super(repo);
  }
}
