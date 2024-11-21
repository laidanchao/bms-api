import { Injectable, NestMiddleware } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { SurchargePrice } from '@/domain/scb/surcharge-price/entities/surcharge-price.entity';
import { SurchargePriceLog } from '@/domain/scb/surcharge-price/entities/surcharge-price-log.entity';
import _ from 'lodash';
import Jwt from 'jsonwebtoken';

@Injectable()
export class SurchargePriceMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void): Promise<any> {
    const user: any = Jwt.decode((req.headers as any)?.authorization.replace('Bearer ', ''));
    if (req.method === 'DELETE') {
      const id = Number((req as any).params?.id);
      const data = await getRepository(SurchargePrice).findOne({ id });
      const deleteSurchargePriceLog = _.pick(data, [
        'month',
        'transporter',
        'type',
        'value',
        'countryCode',
        'comment',
        'description',
      ]);
      await getRepository(SurchargePriceLog).save({
        ...deleteSurchargePriceLog,
        priceId: id,
        status: 'DELETED',
        operator: user.username,
      });
    }
    if (req.method === 'PUT') {
      const editSurchargePriceLog = _.pick(req.body, [
        'month',
        'transporter',
        'type',
        'value',
        'countryCode',
        'comment',
        'description',
      ]);
      await getRepository(SurchargePriceLog).save({
        ...editSurchargePriceLog,
        priceId: (req.body as any)?.id,
        status: 'EDIT',
        operator: user.username,
      });
    }
    next();
  }
}
