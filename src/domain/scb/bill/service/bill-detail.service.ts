import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';

@Injectable()
export class BillDetailService extends TypeOrmCrudService<BillDetail> {
  constructor(@InjectRepository(BillDetail) repo) {
    super(repo);
  }

  public async esendeoUps(month: string, transporterAccountId: string) {
    const bill = await getRepository(Bill).findOne({
      month,
      transporterAccountId,
      transporterId: 'UPS',
    });
    return await this.repo.find({ where: { billId: bill.id } });
  }
}
