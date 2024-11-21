import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import 'moment-timezone';
import { CamSenderAddress } from '@/domain/cam/sender-address/entity/sender-address.entity';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
import _ from 'lodash';
import { CrudRequest, Override } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';

@Injectable()
export class SenderAddressService extends TypeOrmCrudService<CamSenderAddress> {
  constructor(@InjectRepository(CamSenderAddress) repo, private nacosRepository: NacosRepository) {
    super(repo);
  }

  /**
   * @param platform
   */
  getList(platform: string) {
    const senderAddressConfig = this.nacosRepository.getSenderAddressConfig();
    return _.chain(senderAddressConfig)
      .filter(it => it.platform === platform)
      .map('addressCode')
      .value();
  }

  async getByCode(code: string, platform: any) {
    return await this.repo.findOne({
      addressCode: code,
      platform,
    });
  }

  @Override()
  async replaceOne(req: CrudRequest, dto: DeepPartial<CamSenderAddress>) {
    const result = await super.replaceOne(req, dto);
    await this.nacosRepository.setSenderAddressConfig();
    return result;
  }

  @Override()
  async createOne(req: CrudRequest, dto: DeepPartial<CamSenderAddress>): Promise<CamSenderAddress> {
    const result = await super.createOne(req, dto);
    await this.nacosRepository.setSenderAddressConfig();
    return result;
  }

  @Override()
  async deleteOne(req: CrudRequest): Promise<void | CamSenderAddress> {
    await super.deleteOne(req);
    await this.nacosRepository.setSenderAddressConfig();
  }
}
