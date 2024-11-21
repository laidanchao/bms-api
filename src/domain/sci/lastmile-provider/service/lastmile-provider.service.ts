import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { LastmileProvider } from '@/domain/sci/lastmile-provider/entity/lastmile-provider.entity';

@Injectable()
export class LastmileProviderService extends TypeOrmCrudService<LastmileProvider> {
  constructor(@InjectRepository(LastmileProvider) repo) {
    super(repo);
  }
}
