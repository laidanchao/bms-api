import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import 'moment-timezone';
import { CrudRequest, Override } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { AddressRestriction } from '@/domain/cam/address-restriction/entity/address-restriction.entity';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';

@Injectable()
export class AddressRestrictionService extends TypeOrmCrudService<AddressRestriction> {
  constructor(@InjectRepository(AddressRestriction) repo, private nacosRepository: NacosRepository) {
    super(repo);
  }

  @Override()
  async replaceOne(req: CrudRequest, dto: DeepPartial<AddressRestriction>) {
    const result = await super.replaceOne(req, dto);
    await this.nacosRepository.setAddressRestrictionConfig();
    return result;
  }

  @Override()
  async createOne(req: CrudRequest, dto: DeepPartial<AddressRestriction>): Promise<AddressRestriction> {
    const result = await super.createOne(req, dto);
    await this.nacosRepository.setAddressRestrictionConfig();
    return result;
  }

  @Override()
  async deleteOne(req: CrudRequest): Promise<void | AddressRestriction> {
    await super.deleteOne(req);
    await this.nacosRepository.setAddressRestrictionConfig();
  }
}
