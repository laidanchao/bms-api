import { EntityRepository, Repository } from 'typeorm';
import { Bill } from '@/domain/scb/bill/entity/bill.entity';

@EntityRepository(Bill)
export class BillRepository extends Repository<Bill> {
  async fetchAmountAnalysisMenu() {
    return this.createQueryBuilder('w')
      .select('month')
      .addSelect('w.transporterAccountId', 'transporterAccountId')
      .addSelect('w.transporterId', 'transporterId')
      .addSelect('w.routeId', 'routeId')
      .addSelect('year')
      .addGroupBy('w.transporterAccountId')
      .addGroupBy('w.transporterId')
      .addGroupBy('w.routeId')
      .addGroupBy('w.month')
      .addGroupBy('year')
      .getRawMany();
  }

  async fetchExtraFeeAnalysisData(target, wheres) {
    const temp = this.createQueryBuilder('bill')
      .select('bill.month', 'month')
      .addSelect(`SUM(fee.${target})`, target)
      .addSelect('bill.transporterAccountId', 'transporterAccountId')
      .innerJoin('bill.extraFeeDetails', 'fee');
    if (wheres && wheres.name) {
      temp.andWhere('fee.name=:name', { name: wheres.name });
      delete wheres.name;
    }
    if (wheres && wheres.clientId) {
      temp.andWhere('fee.clientId=:clientId', { clientId: wheres.clientId });
      delete wheres.clientId;
    }
    return temp
      .andWhere(wheres)
      .groupBy('bill.month')
      .addGroupBy('bill.transporterAccountId')
      .orderBy('bill.month', 'ASC')
      .getRawMany();
  }

  async fetchExtraFeeAnalysisMenu() {
    return this.createQueryBuilder('bill')
      .select('bill.year', 'year')
      .addSelect('bill.month', 'month')
      .addSelect('bill.transporterId', 'transporterId')
      .addSelect('bill.transporterAccountId', 'transporterAccountId')
      .addSelect('fee.name', 'name')
      .addSelect('SUM(fee.amount)', 'amount')
      .innerJoin('bill.extraFeeDetails', 'fee')
      .addGroupBy('bill.year')
      .addGroupBy('bill.month')
      .addGroupBy('bill.transporterId')
      .addGroupBy('bill.transporterAccountId')
      .addGroupBy('fee.name')
      .getRawMany();
  }

  fetchAnalysisData(target: string, wheres: Record<string, string>) {
    return this.createQueryBuilder('w')
      .select('w.month', 'month')
      .addSelect(`SUM(w.${target})`, target)
      .addSelect('w.transporterAccountId', 'transporterAccountId')
      .where(wheres)
      .groupBy('w.month')
      .addGroupBy('w.transporterAccountId')
      .orderBy('w.month', 'ASC')
      .getRawMany();
  }
}
