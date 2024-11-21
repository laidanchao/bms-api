import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Platform } from '@/domain/base/ssm/platform/entities/platform.entity';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CrudRequest } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';

@Injectable()
export class PlatformService extends TypeOrmCrudService<Platform> {
  constructor(@InjectRepository(Platform) repo, private nacosRepository: NacosRepository) {
    super(repo);
  }

  async createOne(req: CrudRequest, dto: DeepPartial<Platform>) {
    const result = await super.createOne(req, dto);
    await this.nacosRepository.setPlatformConfig();
    return result;
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<Platform>) {
    const result = await super.replaceOne(req, dto);
    await this.nacosRepository.setPlatformConfig();
    return result;
  }

  getSmsProduct(platform: string, transporter: string) {
    const result = { smsProductCode: null, smsIsPushOutside: false };
    const platformConfig = this.nacosRepository.getPlatformConfig();
    const camApplication = platformConfig.find(app => app.id === platform);
    if (
      camApplication &&
      !_.isEmpty(camApplication.smsTransporters) &&
      camApplication.smsTransporters.includes(transporter)
    ) {
      result.smsProductCode = camApplication.smsProductCode;
      result.smsIsPushOutside = camApplication.smsIsPushOutside;
    }
    return result;
  }
}
