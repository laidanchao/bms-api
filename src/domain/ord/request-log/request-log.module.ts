import { Module } from '@nestjs/common';
import { RequestLogService } from '@/domain/ord/request-log/request-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';

@Module({
  providers: [RequestLogService],
  imports: [TypeOrmModule.forFeature([RequestLog])],
  exports: [RequestLogService],
})
export class RequestLogModule {}
