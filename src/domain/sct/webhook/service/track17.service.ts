import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';

@Injectable()
export class Track17Service extends TypeOrmCrudService<Track17> {
  constructor(@InjectRepository(Track17) private track17Repository: Repository<Track17>) {
    super(track17Repository);
  }
}
