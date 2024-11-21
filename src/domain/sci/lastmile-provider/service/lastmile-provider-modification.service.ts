import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { LastmileProviderIdentificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-identification.service';
import { ModificationStatusEnum } from '@/domain/sci/lastmile-provider/enum/modification-status.enum';
import { LastmileProviderModificationRepository } from '@/domain/sci/lastmile-provider/repository/lastmile-provider-modification.repository';
import { BusinessException } from '@/app/exception/business-exception';

@Injectable()
export class LastmileProviderModificationService extends TypeOrmCrudService<LastmileProviderModification> {
  constructor(
    @InjectRepository(LastmileProviderModification) repo,
    @InjectRepository(LastmileProviderModificationRepository)
    private readonly lastmileProviderModificationRepository: LastmileProviderModificationRepository,
    private readonly magicBIService: MagicBIService,
    private readonly lastmileProviderIdentificationService: LastmileProviderIdentificationService,
  ) {
    super(repo);
  }

  /**
   * 包裹统计预览待修复包裹数
   * 同时数据插入待修正表
   * @param query
   */
  async getModifyParcel(query) {
    const { createdAt, lastmileProvider, startWith = [], endWith = [], lengthLimit = [], operator } = query;
    const startTime = createdAt[0];
    const endTime = createdAt[1];
    const batchTimestamp = new Date().getTime();
    const { data: count } = await this.magicBIService.getDataFromBI('lastmileProvider/getLastmileProviderCount', {
      startTime,
      endTime,
      lastmileProvider,
      startWith,
      endWith,
      lengthLimit,
    });

    if (!count) {
      return {
        batchTimestamp,
        count: 0,
      };
    }

    const identifications = await this.lastmileProviderIdentificationService.findRedis();

    let sum = 0;
    let offset = 0;
    const limit = 1000;

    while (offset < count) {
      const { data } = await this.magicBIService.getDataFromBI('lastmileProvider/getLastmileProviderParcel', {
        startTime,
        endTime,
        lastmileProvider,
        startWith,
        endWith,
        lengthLimit,
        offset,
        limit,
      });
      const bulkData = [];
      for (const parcel of data) {
        const lastmileProviderIdentify =
          this.lastmileProviderIdentificationService.getLastmileProvider(parcel.trackingnumber, identifications) ||
          'UNKNOWN';
        if (lastmileProviderIdentify !== parcel.lastmileprovider) {
          sum++;
          bulkData.push({
            trackingNumber: parcel.trackingnumber,
            transporter: parcel.transporter,
            originalLastmileProvider: parcel.lastmileprovider,
            lastmileProvider: lastmileProviderIdentify,
            status: ModificationStatusEnum.PREVIEW,
            batchTimestamp,
            operator,
          });
        }
      }
      if (bulkData.length) {
        await this.lastmileProviderModificationRepository.bulkInsert(bulkData);
      }
      offset += limit;
    }
    return {
      batchTimestamp,
      count: sum,
    };
  }

  /**
   * 更新同一时间批次需要更新的包裹状态
   * @param batchTimestamp
   */
  async editModifyStatus(batchTimestamp) {
    if (!batchTimestamp) {
      throw new BusinessException('请先进行包裹统计后再进行修改');
    }
    await this.repo.update({ batchTimestamp }, { status: ModificationStatusEnum.TO_BE_MODIFIED });
  }
}
