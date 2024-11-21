import { Test } from '@nestjs/testing';
import { BmsController } from '@/application/scb/bms.controller';
import { FuelRateService } from '@/domain/scb/fuel-rate/service/fuel-rate.service';
import { BillService } from '@/domain/scb/bill/service/bill.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuantityDistributionModule } from '@/domain/srs/quantity-distribution/quantity-distribution.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import ormConfig from '@/domain/base/repository/config/orm.config';

describe('bms controller test', () => {
  let bmsController: BmsController;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [BmsController],
      imports: [
        QuantityDistributionModule,
        ConfigModule.forRoot({
          load: [configuration],
          envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        TypeOrmModule.forRoot(ormConfig()),
      ],
      providers: [
        {
          provide: 'FuelRateService',
          useValue: {},
        },
        {
          provide: 'PurchaseBillService',
          useValue: {},
        },
        {
          provide: 'DeclareQuantityDistributionService',
          useValue: {},
        },
        {
          provide: 'TransferQuantityDistributionService',
          useValue: {},
        },
      ],
    }).compile();
    bmsController = testingModule.get(BmsController);
  });

  /**
   * 检查返回数据的key是否是bms的dto所需
   */
  it('parcelQuantity', async () => {
    const parcelQuantityArray = await bmsController.getParcelQuantity('2022-03', 'COLISSIMO', 'WDT');
    parcelQuantityArray.forEach(parcelQuantity => {
      expect(parcelQuantity).toHaveProperty('declaredQuantity');
      expect(parcelQuantity).toHaveProperty('transferredQuantity');
    });
  });
});
