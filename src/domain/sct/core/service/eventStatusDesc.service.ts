import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventStatusDesc } from '@/domain/sct/core/entity/eventStatusDesc.entity';

@Injectable()
export class EventStatusDescService extends TypeOrmCrudService<EventStatusDesc> {
  constructor(@InjectRepository(EventStatusDesc) repo) {
    super(repo);
  }
}
