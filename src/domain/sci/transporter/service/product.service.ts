import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { TransporterProduct } from '../entities/transporter-product.entity';

@Injectable()
export class ProductService extends TypeOrmCrudService<TransporterProduct> {
  constructor(@InjectRepository(TransporterProduct) repo) {
    super(repo);
  }
}
