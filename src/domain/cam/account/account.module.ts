import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from '@/domain/cam/account/account.service';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';

@Module({
  providers: [AccountService, RedisCacheNewService],
  imports: [TypeOrmModule.forFeature([Account])],
  exports: [AccountService],
})
export class AccountModule {}
