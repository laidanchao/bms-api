import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CrudRequest, Override } from '@nestjsx/crud';
import { DeepPartial, Not } from 'typeorm';
import { BusinessException } from '@/app/exception/business-exception';

@Injectable()
export class CrawlerConfigService extends TypeOrmCrudService<CrawlerConfig> {
  constructor(@InjectRepository(CrawlerConfig) repo) {
    super(repo);
  }

  @Override()
  async createOne(req: CrudRequest, dto: DeepPartial<CrawlerConfig>): Promise<CrawlerConfig> {
    if (!dto.enabled) {
      throw new BusinessException('新增的配置必须是生效状态');
    }

    const existConfig = await this.repo.find({
      transporter: dto.transporter,
      parcelType: dto.parcelType,
    });

    this.saveCheck(existConfig, dto);
    return super.createOne(req, dto);
  }

  @Override()
  async replaceOne(req: CrudRequest, dto: DeepPartial<CrawlerConfig>) {
    const id = req.parsed.paramsFilter[0].value;
    const existConfig = await this.repo.find({
      transporter: dto.transporter,
      id: Not(id),
      parcelType: dto.parcelType,
    });

    this.saveCheck(existConfig, dto);
    return super.replaceOne(req, dto);
  }

  private saveCheck(existConfig: CrawlerConfig[], dto: DeepPartial<CrawlerConfig>) {
    const isExist = existConfig.some(s => s.platform === dto.platform || [s.platform, dto.platform].includes('*'));
    if (isExist) {
      throw new BusinessException('派送商+平台+包裹类型需组合唯一');
    }
  }
}
