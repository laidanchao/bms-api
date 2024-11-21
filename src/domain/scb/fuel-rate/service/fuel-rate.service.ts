import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FuelRateService extends TypeOrmCrudService<FuelRate> {
  constructor(@InjectRepository(FuelRate) repo) {
    super(repo);
  }

  public async bms(month: string, transporter: string): Promise<FuelRate[]> {
    return await this.repo.find({
      where: {
        month,
        transporter,
      },
    });
  }
}
