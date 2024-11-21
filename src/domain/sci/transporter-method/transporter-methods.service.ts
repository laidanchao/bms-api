import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { TransporterMethods } from '@/domain/sci/transporter-method/transporter-methods.entity';

@Injectable()
export class TransporterMethodsService extends TypeOrmCrudService<TransporterMethods> {
  constructor(@InjectRepository(TransporterMethods) repo) {
    super(repo);
  }
  fetchAllData() {
    return this.repo.find();
  }
}
