import { Account } from '@/domain/cam/account/entities/account.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import _ from 'lodash';
@Injectable()
export class AccountService extends TypeOrmCrudService<Account> {
  constructor(@InjectRepository(Account) repo) {
    super(repo);
  }

  @Cacheable({ cacheKey: args => `CMS_WEBHOOK_ACCOUNT_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findAccountInfoRedis(
    platform,
  ): Promise<{ account: string; platform: string; transporterId: string; accountInfo: {} }[]> {
    const platformAccount = await this.repo.find({
      where: { transporterId: platform },
      select: ['account', 'platform', 'transporterId', 'accountInfo'],
    });
    return platformAccount;
  }

  @Cacheable({ cacheKey: args => `CMS_TRANSPORTER_ACCOUNT_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  public async findAccountByTransporterMap(transporterId) {
    const transporterAccount = await this.repo.find({
      where: {
        transporterId,
      },
    });
    return _.mapKeys(transporterAccount, 'account');
  }
}
