import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { FileLog } from '@/domain/sct/file/entity/file-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class FileLogService extends TypeOrmCrudService<FileLog> {
  constructor(@InjectRepository(FileLog) repo: Repository<FileLog>) {
    super(repo);
  }

  async create(event): Promise<any> {
    return this.repo.save(event);
  }
}
