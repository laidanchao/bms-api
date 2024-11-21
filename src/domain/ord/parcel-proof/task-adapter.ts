import { Injectable } from '@nestjs/common';
import { TaskExecutor } from '@/domain/ord/parcel-proof/task-executor';
import { LastmileProvider, Transporter } from '@/domain/utils/Enums';
import { ColispriveExecutor } from '@/domain/ord/parcel-proof/executor/colisprive.executor';
import { ColiColiExecutor } from '@/domain/ord/parcel-proof/executor/colicoli.executor';
import { ColissimoExecutor } from '@/domain/ord/parcel-proof/executor/colissimo.executor';
import { DpdExecutor } from '@/domain/ord/parcel-proof/executor/dpd.executor';
import { BusinessException } from '@/app/exception/business-exception';

@Injectable()
export class TaskAdapter {
  public getExecutor(lastmileProvider: LastmileProvider): TaskExecutor {
    switch (lastmileProvider) {
      case LastmileProvider.COLISPRIVE:
        return new ColispriveExecutor();
      case LastmileProvider.COLICOLI:
        return new ColiColiExecutor();
      case LastmileProvider.COLISSIMO:
        return new ColissimoExecutor();
      case LastmileProvider.DPD:
      case LastmileProvider.DPD_CN:
        return new DpdExecutor();
      default:
        throw new BusinessException(`'${lastmileProvider}' Executor is not found`);
        break;
    }
  }
}
