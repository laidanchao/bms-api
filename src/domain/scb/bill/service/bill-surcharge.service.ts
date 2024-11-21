import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BillSurchargeEntity } from '@/domain/scb/bill/entity/bill-surcharge.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BillSurchargeService extends TypeOrmCrudService<BillSurchargeEntity> {
  constructor(@InjectRepository(BillSurchargeEntity) repo) {
    super(repo);
  }
}
