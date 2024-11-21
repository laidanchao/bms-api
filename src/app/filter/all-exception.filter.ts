import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from '@/app/logger';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private redisService: RedisCacheNewService = new RedisCacheNewService();
  catch(exception: any, host: ArgumentsHost) {
    Logger.error(exception.stack);
    if (!(exception instanceof HttpException)) {
      exception = new HttpException(exception.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    // if (exception.getStatus() === 500 && !/[\u4e00-\u9fa5]/.test(exception.message)) {
    //   this.redisService.sAdd('exception', JSON.stringify(exception.message)).then();
    // }
    super.catch(exception, host);
  }
}
