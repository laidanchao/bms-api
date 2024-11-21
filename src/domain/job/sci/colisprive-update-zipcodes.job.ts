import { FtpJob } from '@/domain/job/base/ftp.job';
import { Inject, Logger } from '@nestjs/common';
import { Moment } from '@softbrains/common-utils';
import { ConfigService } from '@nestjs/config';
import _ from 'lodash';
import { TransporterZoneService } from '@/domain/sci/transporter-zone/transporter-zone.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { Transporter } from '@/domain/utils/Enums';

/**
 * 解析 Colisprive 邮编文件
 */
export class ColispriveUpdateZipcodesJob extends FtpJob {
  constructor(
    private readonly transporterZoneService: TransporterZoneService,
    @Inject(ConfigService) configService: ConfigService,
    xPushService: XPushService,
  ) {
    super(xPushService, configService);
    this.config = configService.get(ColispriveUpdateZipcodesJob.name);
    console.log('ColispriveUpdateZipcodesJob init success');
  }

  // @Cron("0 0 1/1 * * *")
  // @Cron('0 */10 * * * *') // for test
  async execute(option = {}) {
    await super.execute(option);
  }

  /**
   * Handle tracking file.
   * @returns {Promise<*|Promise<void>>}
   * @private
   */
  async _handleFile(file, source) {
    const transporter = Transporter.COLISPRIVE;
    await super._handleFile(file, source);
    const { success } = this.config.ftp;
    const route = file.name.includes('5P') ? 'CP_FR_CSORT' : 'CP_FR';
    if (file.name.endsWith('.dat') && ['fcpcli5P.dat', 'fcpcliD0.dat'].includes(file.name)) {
      const data = await this.ftpClient.getAsCSV(`${source}/${file.name}`);
      data.slice(1).map(i => ({
        postalCode: i[0],
      }));
      const cpZones = data.slice(1, data.length - 1).map(i => {
        const active = i[0].slice(13, 14) === 'O';

        return {
          postalCode: i[0].slice(0, 5),
          active,
          route,
          transporter,
        };
      });

      const results = await this.transporterZoneService.find({ where: { route, transporter } });
      const canUpdateCpZones = [];
      const canInsertCpZones = [];
      const fileName = file.name.split('.');
      try {
        //如果没有数据,初始化,否则,更新原有数据
        if (results.length === 0) {
          await this.transporterZoneService.bulkInsert(cpZones);
        } else {
          cpZones.map(zone => {
            const existed = results.find(
              result => result.postalCode === zone.postalCode && result.route === zone.route,
            );
            if (existed) {
              existed.active = zone.active;
              existed.updatedAt = new Date();
              canUpdateCpZones.push(existed);
            } else {
              canUpdateCpZones.push(zone);
            }
          });
          await this.transporterZoneService.bulkInsert(canInsertCpZones);
          const chunk = _.chunk(canUpdateCpZones, 3000);
          for (const codes of chunk) {
            await this.transporterZoneService.bulkUpdate(codes, ['active', 'updatedAt']);
          }
        }
        await this.transporterZoneService.deleteCachePattern();
        await this.ftpClient.rename(
          `${source}/${file.name}`,
          `${success}/${fileName[0]}_${Moment().format('YYYYMMDDHHmmss')}.dat`,
        );
      } catch (e) {
        this.xPushService.sendDingDing(`error occur in ColispriveUpdateZipcodesJob executing, errormsg: ${e.message}`);
        Logger.error(e);
      }
    }
  }
}
