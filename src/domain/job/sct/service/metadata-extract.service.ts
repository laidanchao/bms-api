import { Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import { TrackingConstants } from '@/domain/sct/file/entity/file-record.entity';
import { FileLog } from '@/domain/sct/file/entity/file-log.entity';
import { FileRecordService } from '@/domain/sct/file/service/file-record.service';
import { FileLogService } from '@/domain/sct/file/service/file-log.service';
import _ from 'lodash';
import { AwsService } from '@/domain/external/aws/aws.service';

@Injectable()
export class MetadataExtractService {
  constructor(
    @Inject(FileRecordService) private fileRecordService: FileRecordService,
    private fileLogService: FileLogService,
    private awsService: AwsService,
  ) {}

  public async extractTracking(
    file,
    ftpClient,
    transporter,
    path: { sourcePath: string; extractedPath: string; s3Path: string; bucket: string },
  ) {
    if (_.isEmpty(file.sftpAccount)) {
      return;
    }
    const { sourcePath, extractedPath, s3Path, bucket } = path;

    // 1. 上传轨迹文件到S3
    const data = await ftpClient.get(sourcePath);
    await this.awsService.uploadFile(data, s3Path, bucket);

    // 2. 保存文件提取记录
    await this.saveFileRecord(file, s3Path, transporter);

    // 3. 移动文件（将已提取的文件移动至已提取文件夹）
    await ftpClient.rename(sourcePath, extractedPath);
  }

  public async saveFileRecord(file: any, fileUrl: string, transporter: string): Promise<void> {
    let sourceDate = '',
      transporterAccountId = '';
    switch (transporter) {
      case 'COLISSIMO':
        sourceDate = file.name.split('.')[1];
        transporterAccountId = file.name.split('.')[0];
        break;
      case 'COLISPRIVE':
        sourceDate = moment(file.name.split('_')[1]).format('YYMMDD');
        transporterAccountId = file.name.split('_')[0];
        break;
      case 'MONDIAL_RELAY':
        sourceDate = file.name.split('.')[2].slice(1);
        break;
      case 'DISPEO':
        sourceDate = moment(file.name.split('_')[3]).format('YYMMDD');
        break;
      default:
        break;
    }

    const startDate = moment().toDate();
    const fileRecord = {
      uploadDate: moment(file.accessTime)
        .utc()
        .format('YYYY-MM-DD HH:mm:ss Z'),
      name: file.name,
      sourceDate,
      size: file.size,
      lastModifyAt: moment(file.modifyTime).toDate(),
      sftpAccount: file.sftpAccount,
      transporterAccountId,
      fileUrl,
      event: TrackingConstants.EXTRACTED_EVENT,
      transporter,
    };
    const found = await this.fileRecordService.findOne({
      where: {
        name: file.name,
        size: file.size,
      },
    });
    if (found) {
      await this.fileRecordService.update({ id: found.id }, fileRecord);
    } else {
      const db = await this.fileRecordService.create(fileRecord);
      // 插入事件
      const fileLog = new FileLog();
      fileLog.referenceId = db.id;
      fileLog.event = TrackingConstants.EXTRACTED_EVENT;
      fileLog.resourceName = fileRecord.transporter;
      fileLog.elapsedTime = moment().diff(startDate);
      await this.fileLogService.create(fileLog);
    }
  }
}
