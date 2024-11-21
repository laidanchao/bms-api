import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import 'moment-timezone';
@Injectable()
export class LabelFormatService extends TypeOrmCrudService<LabelFormat> {
  constructor(@InjectRepository(LabelFormat) repo) {
    super(repo);
  }
}
