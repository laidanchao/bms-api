import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IndemnityDetail } from '@/domain/scb/bill/entity/indemnity-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndemnityDetailService extends TypeOrmCrudService<IndemnityDetail> {
  constructor(@InjectRepository(IndemnityDetail) repo) {
    super(repo);
  }
}
