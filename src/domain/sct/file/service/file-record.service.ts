import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRecord } from '@/domain/sct/file/entity/file-record.entity';
import { ConfigService } from '@nestjs/config';
import { AwsService } from '@/domain/external/aws/aws.service';
import { FileLog } from '@/domain/sct/file/entity/file-log.entity';
import { FileLogService } from '@/domain/sct/file/service/file-log.service';
import moment from 'moment';

@Injectable()
export class FileRecordService extends TypeOrmCrudService<FileRecord> {
  constructor(
    @InjectRepository(FileRecord) repo,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly eventService: FileLogService,
  ) {
    super(repo);
  }

  async create(colissimoTrackingFile) {
    return await this.repo.save(colissimoTrackingFile);
  }

  async update(criteria, colissimoTrackingFile) {
    return this.repo.update(criteria, colissimoTrackingFile);
  }

  async downloadTracking(path: string) {
    return await this.awsService.getSignedUrl(path, this.configService.get('Bucket').cms, 60);
  }

  public async existByNameAndSize(name: string, size: string): Promise<boolean> {
    const entity = await this.repo.findOne({
      where: {
        name,
        size,
      },
    });
    return !!entity;
  }

  public async findByAccountIdAndSourceDate(accountId: string, sourceDate: string): Promise<FileRecord[]> {
    return this.repo.find({
      where: { transporterAccountId: accountId, sourceDate },
    });
  }

  public async findByEvent(event: string, limit?): Promise<FileRecord[]> {
    const findOptions: any = {
      where: { event },
      order: {
        uploadDate: 'ASC',
        sourceDate: 'ASC',
        id: 'ASC',
      },
    };
    if (limit) {
      Object.assign(findOptions, { take: limit });
    }
    return this.repo.find(findOptions);
  }

  public async findByName(name: string): Promise<FileRecord[]> {
    return this.repo.find({
      where: { name },
    });
  }

  /**
   * 更新文件状态和添加一条log
   * @param id tracking_file id
   * @param resourceName 来源name
   * @param affectObj 更改的状态和对应的时间
   * @param startTime 程序开始执行时间
   */
  public async updateByEvent(id, resourceName, affectObj, startDate) {
    const elapsedTime = moment().diff(startDate);
    const result = await this.update({ id }, affectObj);
    if (result.affected > 0) {
      // 插入事件
      const event = new FileLog();
      event.referenceId = id;
      event.event = affectObj.event;
      event.resourceName = resourceName;
      event.elapsedTime = elapsedTime;
      await this.eventService.create(event);
    }
  }
}
