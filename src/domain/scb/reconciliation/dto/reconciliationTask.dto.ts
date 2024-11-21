import { IsArray, IsString } from 'class-validator';

export class ReconciliationTaskDto {
  @IsString()
  transporterId: string;

  @IsString()
  billYearMonth: string; // 对账单月份，格式：YYYY-MM

  @IsArray()
  productCodes: string[]; // 产品码集合
}
