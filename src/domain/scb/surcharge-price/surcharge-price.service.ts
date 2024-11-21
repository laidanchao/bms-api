import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SurchargePrice } from '@/domain/scb/surcharge-price/entities/surcharge-price.entity';
import { Not } from 'typeorm';

@Injectable()
export class SurchargePriceService extends TypeOrmCrudService<SurchargePrice> {
  constructor(@InjectRepository(SurchargePrice) repo) {
    super(repo);
  }

  async getSurchargePrice(month: string) {
    const extraExceptT = await this.repo.find({
      where: {
        type: Not('T'),
        month,
      },
    });
    const extraT = await this.repo.find({
      where: {
        type: 'T',
        month: month,
      },
    });
    const typeMapping = extraExceptT.reduce((a, b) => {
      return (a[b.type] = b.value), a;
    }, {});
    const TMapping = extraT.reduce((a, b) => {
      return (a[b.countryCode] = b.value), a;
    }, {});
    return { typeMapping, TMapping };
  }
}
