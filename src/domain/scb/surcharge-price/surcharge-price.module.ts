import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurchargePriceService } from '@/domain/scb/surcharge-price/surcharge-price.service';
import { SurchargePrice } from '@/domain/scb/surcharge-price/entities/surcharge-price.entity';
import { SurchargePriceMiddleware } from '@/app/middlerware/surcharge-price.middleware';
import { SurchargePriceController } from '@/application/scb/surcharge-price.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SurchargePrice])],
  providers: [SurchargePriceService],
  exports: [SurchargePriceService],
})
export class SurchargePriceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(SurchargePriceMiddleware).forRoutes(SurchargePriceController);
  }
}
