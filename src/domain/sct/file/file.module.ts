import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLog } from '@/domain/sct/file/entity/file-log.entity';
import { FileRecord } from '@/domain/sct/file/entity/file-record.entity';
import { FileRecordService } from '@/domain/sct/file/service/file-record.service';
import { FileLogService } from '@/domain/sct/file/service/file-log.service';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigService } from '@nestjs/config';
import { FtpSetting } from '@/domain/sct/file/entity/ftp-setting.entity';
import { FtpSettingService } from '@/domain/sct/file/service/ftp-setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileLog, FileRecord, FtpSetting]), AwsModule],
  providers: [FileRecordService, FileLogService, ConfigService, FtpSettingService],
  exports: [FileRecordService, FileLogService, FtpSettingService],
})
export class FileModule {}
