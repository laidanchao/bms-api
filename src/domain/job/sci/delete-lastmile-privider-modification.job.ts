import { Injectable, Logger } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { getRepository } from 'typeorm';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';
import { ModificationStatusEnum } from '@/domain/sci/lastmile-provider/enum/modification-status.enum';
import moment from 'moment/moment';

@Injectable()
export class DeleteLastmilePrividerModificationJob extends NormalJob {
  constructor() {
    super();
  }

  async execute(option?): Promise<void> {
    // Logger.log(`${this.constructor.name} has been called`);
    this.handle(option)
      .then(() => {})
      .catch(reason => {
        Logger.log(`${this.constructor.name} execute fail, reason: ${reason}`);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async handle(option?): Promise<any> {
    const cutOffTime = moment()
      .subtract(1, 'day')
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    await getRepository(LastmileProviderModification).delete({
      status: ModificationStatusEnum.PREVIEW,
      createdAt: cutOffTime,
    });
  }
}
