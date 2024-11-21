import { Injectable, Logger } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { getRepository, In } from 'typeorm';
import { LastmileProviderModification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-modification.entity';
import { ModificationStatusEnum } from '@/domain/sci/lastmile-provider/enum/modification-status.enum';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import _ from 'lodash';

@Injectable()
export class ModifyParcelLastmilePrividerJob extends NormalJob {
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
    const needModifyParcels: LastmileProviderModification[] = await getRepository(LastmileProviderModification).find({
      where: {
        status: ModificationStatusEnum.TO_BE_MODIFIED,
      },
      order: {
        createdAt: 'ASC',
        transporter: 'DESC',
      },
      take: 500,
    });
    if (!needModifyParcels.length) return;

    const providerGroup = _.groupBy(needModifyParcels, 'lastmileProvider');

    for (const lastmileProvider of Object.keys(providerGroup)) {
      const trackingNumberList = _.map(providerGroup[lastmileProvider], 'trackingNumber');

      await getRepository(Parcel).update({ trackingNumber: In(trackingNumberList) }, { lastmileProvider });

      await getRepository(LastmileProviderModification).update(
        { trackingNumber: In(trackingNumberList) },
        { status: ModificationStatusEnum.MODIFIED },
      );
    }
  }
}
