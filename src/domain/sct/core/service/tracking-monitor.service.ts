import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TRACKING_MONITOR_TYPE, TrackingMonitor } from '@/domain/sct/core/entity/tracking-monitor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository } from 'typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import _ from 'lodash';
import moment from 'moment';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import XLSX from 'xlsx';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { SystemVariableService } from '@/domain/base/ssm/system/system-variable.service';

@Injectable()
export class TrackingMonitorService extends TypeOrmCrudService<TrackingMonitor> {
  constructor(
    @InjectRepository(TrackingMonitor) repo,
    private systemVariableService: SystemVariableService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private readonly xPushService: XPushService,
    private readonly magicBIService: MagicBIService,
  ) {
    super(repo);
  }

  /**
   * 生成并插入数据库日期date的时效
   * @param date YYYY-MM-DD
   */
  async insetTrackingMonitor(date: string) {
    const trackingMonitor = await this.genTrackingMonitor(date, 'YYYY-MM-DD hh:mm:ss');
    return await this.repo.save(trackingMonitor);
  }

  /**
   * 更新日期date的时效数据
   * @param date YYYY-MM-DD
   */
  async refreshTrackingMonitor(date: string) {
    const localTrackingMonitor = await this.repo.find({ date });
    const currentTrackingMonitor = await this.genTrackingMonitor(date);
    currentTrackingMonitor.forEach(monitor => {
      const localRecord = _.find(
        localTrackingMonitor,
        localMonitor =>
          localMonitor.date === monitor.date &&
          localMonitor.type === monitor.type &&
          localMonitor.transporter === monitor.transporter,
      );
      if (localRecord && localRecord.id) {
        monitor.id = localRecord.id;
      }
    });
    return await this.repo.save(currentTrackingMonitor);
  }

  /**
   * 分别统计轨迹获取时效和轨迹推送时效
   * 按派送商统计每天数据
   * @param date
   * @param format bi数据会延迟，当天12:30统计00-12时间段得数据
   */
  async genTrackingMonitor(date: string, format = 'YYYY-MM-DD HH:mm:ss') {
    const startTime = moment(date)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment(date)
      .endOf('day')
      .format(format);
    // 找出字典里配置的时效时间段类型
    const [mediumTime, attentionTime, lateTime] = await Promise.all([
      this.systemVariableService.findByKey('mediumTime'),
      this.systemVariableService.findByKey('attentionTime'),
      this.systemVariableService.findByKey('lateTime'),
    ]);
    const ageingState = {
      mediumTimeMin: Number(mediumTime.value) * 60,
      attentionTimeMin: Number(attentionTime.value) * 60,
      lateTimeMin: Number(lateTime.value) * 60,
    };
    // 轨迹获取时效
    const getTransporterList = await getRepository(Transporter).find({ select: ['id'] });
    const trackingGetMonitor = await this.genTrackingMonitorByType(
      _.map(getTransporterList, 'id'),
      startTime,
      endTime,
      date,
      ageingState,
      TRACKING_MONITOR_TYPE.get,
    );
    //轨迹推送时效
    const trackingPushConfig = await getRepository(TrackingPush).find({ where: { enabled: true } });
    const pushTransporterList = _.chain(trackingPushConfig)
      .map('transporterIds')
      .flattenDeep()
      .uniq()
      .value();
    const trackingPushMonitor = await this.genTrackingMonitorByType(
      pushTransporterList,
      startTime,
      endTime,
      date,
      ageingState,
      TRACKING_MONITOR_TYPE.push,
    );

    return [...trackingGetMonitor, ...trackingPushMonitor];
  }

  /**
   * 轨迹获取时效统计
   * @param transporterList 需要统计的派送商集合
   * @param startTime
   * @param endTime
   * @param date
   * @param ageingState 统计时间段
   * @param type 获取/推送
   */
  async genTrackingMonitorByType(transporterList, startTime, endTime, date, ageingState, type) {
    const trackingGetMonitorDaily = [];
    let getStatisticsPath = '';
    let getLateTracking = '';
    switch (type) {
      case TRACKING_MONITOR_TYPE.get:
        getStatisticsPath = 'trackingAgeing/genTrackingGetMonitor';
        getLateTracking = 'trackingAgeing/lateGetTracking';
        break;
      case TRACKING_MONITOR_TYPE.push:
        getStatisticsPath = 'trackingAgeing/genTrackingPushMonitor';
        getLateTracking = 'trackingAgeing/latePushTracking';
        break;
      default:
        break;
    }
    // 统计数量
    const { data: statisticsResult } = await this.magicBIService.getDataFromBI(getStatisticsPath, {
      startTime,
      endTime,
      ageingState,
    });
    const statisticsTransporterMap = _.mapKeys(statisticsResult, 'transporter');

    const promises = _.map(transporterList, async transporter => {
      const transporterNum = statisticsTransporterMap[transporter] || {
        fastnum: 0,
        mediumnum: 0,
        attentionnum: 0,
        latenum: 0,
        nullnum: 0,
        totalnum: 0,
      };
      let lateFileUrl = '';
      // 时效为late的文件需要导出轨迹明细
      if (transporterNum.latenum > 0) {
        lateFileUrl = await this.genLateFile(
          date,
          transporter,
          getLateTracking,
          startTime,
          endTime,
          ageingState.lateTimeMin,
        );
      }
      if (transporterNum.nullnum) {
        const content =
          `**<font color="#01B2BC">轨迹${type}计算时效错误</font>**\n\n ` +
          `* 条数：${transporterNum.nullnum}\n` +
          `* 派送商：${transporter}\n` +
          `* 状态： 轨迹已插入，但计算时效失败`;
        this.xPushService.sendDingDing(content, 'tracking').then();
      }
      const totalRateNum = transporterNum.totalnum || 1;
      const monitorByTransporter = {
        date,
        type,
        transporter,
        fastNum: transporterNum.fastnum,
        mediumNum: transporterNum.mediumnum,
        attentionNum: transporterNum.attentionnum,
        lateNum: transporterNum.latenum,
        totalNum: transporterNum.totalnum,
        fastRate: (transporterNum.fastnum / totalRateNum).toFixed(4),
        mediumRate: (transporterNum.mediumnum / totalRateNum).toFixed(4),
        attentionRate: (transporterNum.attentionnum / totalRateNum).toFixed(4),
        lateRate: (transporterNum.latenum / totalRateNum).toFixed(4),
        lateFileUrl,
      };
      trackingGetMonitorDaily.push(monitorByTransporter);
    });
    await Promise.all(promises);
    return trackingGetMonitorDaily;
  }

  /**
   *生成时效为late的文件url
   * @param date
   * @param transporter
   * @param path
   * @param startTime
   * @param endTime
   * @param lateTimeMin
   */
  async genLateFile(date, transporter, path, startTime, endTime, lateTimeMin) {
    const { data } = await this.magicBIService.getDataFromBI(path, {
      startTime,
      endTime,
      lateTimeMin,
      transporter,
    });
    const lateTrackingArray = data.split('-;-').map(it => {
      return JSON.parse(it);
    });
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(lateTrackingArray, { skipHeader: false, cellStyles: true });
    XLSX.utils.book_append_sheet(book, sheet, '时效为late的轨迹');
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'buffer', cellStyles: true });
    const filePath = `tracking/tracking_monitor/${transporter}-${path}-${date}.xlsx`;
    await this.awsService.uploadFile(buffer, filePath, this.configService.get('Bucket').cms);
    return filePath;
  }
}
