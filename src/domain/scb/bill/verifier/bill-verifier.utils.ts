import { Bill } from '@/domain/scb/bill/entity/bill.entity';
import _ from 'lodash';

export class BillVerifierUtils {
  public convertDataToTaskResult(
    billData: number,
    summaryData: number,
    name: string,
    billVerifyLimitValue: number,
  ): Record<string, any> {
    const result: boolean = this.compare(billData, summaryData, billVerifyLimitValue);
    return { name, result, billData, summaryData, diff: billData - summaryData };
  }

  public getBillValue(bills: Bill[], key: string): number {
    return _.chain(bills)
      .sumBy(key)
      .round(2)
      .value();
  }

  public getValue(data: any[][], name: string, index: number): number {
    return _.chain(data)
      .filter(item => item[0] === name)
      .map(item => item[index])
      .sum()
      .round(2)
      .value();
  }

  public getFuelRates(data: any[][], name: string, index: number): number[] {
    return _.chain(data)
      .filter(item => item[0] === name)
      .map(item => item[index])
      .uniq()
      .value();
  }

  private compare(data1: number, data2: number, billVerifyLimitValue: number): boolean {
    return Math.abs(data1 - data2) <= billVerifyLimitValue;
  }
}
