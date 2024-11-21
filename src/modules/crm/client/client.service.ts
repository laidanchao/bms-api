import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { Client } from '@/modules/crm/client/client.entity';

@Injectable()
export class ClientService extends TypeOrmCrudService<Client> {
  constructor(@InjectRepository(Client) repo) {
    super(repo);
  }


}
