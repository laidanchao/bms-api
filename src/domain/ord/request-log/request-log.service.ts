import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestLogService extends TypeOrmCrudService<RequestLog> {
  constructor(@InjectRepository(RequestLog) repo) {
    super(repo);
  }
}
