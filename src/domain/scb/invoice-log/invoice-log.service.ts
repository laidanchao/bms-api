import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InvoiceLog } from '@/domain/scb/invoice-log/entities/invoice-log.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoiceLogService extends TypeOrmCrudService<InvoiceLog> {
  private readonly bucketConfig: Record<string, any>;
  constructor(@InjectRepository(InvoiceLog) repo, private readonly configService: ConfigService) {
    super(repo);
    this.bucketConfig = this.configService.get('Bucket');
  }

  async create(invoiceLogArray) {
    return await this.repo.save(invoiceLogArray);
  }

  /**
   * 根据invoiceId 删除bill
   * for 重新解析删除之前的账单记录
   */
  async deleteByInvoiceId(invoiceId: number) {
    return await this.repo.delete({ invoiceId });
  }
}
