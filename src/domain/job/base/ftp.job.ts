import { Logger } from '@nestjs/common';
import FTP from '@softbrains/ftp';
import _ from 'lodash';
import { JobInterface } from '@/domain/job/base/job.interface';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '@/app/exception/business-exception';
import { XPushService } from '@/domain/external/xpush/x-push.service';

export class FtpJob extends JobInterface {
  config: Record<string, any>;
  ftpClient: FTP;
  xPushService: XPushService;
  configService: ConfigService;

  constructor(xPushService: XPushService, configService: ConfigService) {
    super();
    this.config = configService.get(this.constructor.name);
    if (process.env.NODE_ENV === 'production' && !this.config) {
      throw new BusinessException('config is required!');
    }
    this.configService = configService;
    // do nothing
    this.xPushService = xPushService;
    this.ftpClient = new FTP();
  }

  async execute(option = {}) {
    Logger.log(`${this.constructor.name} has been called`);
    await this._before(option);
    await this.handle(option);
    await this._after();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _before(option: any = {}) {
    Logger.log('connect FTP');
    // TODO weifeng step4
    //  1.这个JOB是单例, 容器起来之前就实例化好了, 放入容器中, 那么该ftpClient属性也是共用的.
    //  当前ftpclient如果仍然在连接状态读取文件流时, job并发的执行任务的时候会重新new一个实例,最后导致会有BUG
    await this.ftpClient.connect(option.ftp || this.config.ftp);
    Logger.log(`FTP server connect successful`);
  }

  async _after() {
    Logger.log('disconnect FTP');
    await this.ftpClient.end();
  }

  async handle(options: any = {}) {
    const ftpConfig = options.ftp || this.config.ftp;
    const { retry, source } = ftpConfig;
    if (retry) {
      // move retry files to source folder
      await this._handleRetryFolders(retry, source, ftpConfig, options);
    }

    // handle files in source folder
    let fileOrFolders = [];
    try {
      fileOrFolders = await this.ftpClient.list(source);
    } catch (err) {
      this._jobErrorMsg(err, `${this.constructor.name}: ${source} ${err.message || err}`, source);
    }
    const files = _.chain(fileOrFolders)
      .filter(file => file.type !== 'd')
      .orderBy('name')
      .value();
    for (const file of files) {
      try {
        file.sftpAccount = ftpConfig.username;
        await this._handleFile(file, source, options);
      } catch (err) {
        if (retry) {
          await this._handleErrorFolders(retry, source, file);
        }
        this._jobErrorMsg(err);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _handleFile(file, source, options: any = {}) {
    Logger.log(`${this.constructor.name} handling file ${file.name}`);
  }

  async _handleErrorFolders(retry, source, file) {
    const path = _.isArray(retry) ? retry[0] || '' : retry;
    try {
      await this._renameFile(`${source}/${file.name}`, `${path}/${file.name}`);
    } catch (e) {
      this._jobErrorMsg(
        e,
        `${this.constructor.name}: ${source}/${file.name} already exists in the folder ${path}`,
        `${source} or ${path}`,
      );
    }
  }

  async _handleRetryFolders(retry, source, ftpConfig, options) {
    // handle multiple folders
    if (_.isArray(retry)) {
      for (const folder of retry) {
        await this._handleRetryFolders(folder, source, ftpConfig, options);
      }
      return;
    }

    // handle one folder
    // move retryFiles to source folder
    const retryFilesOrFolders = await this.ftpClient.list(retry);
    const retryFiles = _.chain(retryFilesOrFolders)
      .filter(file => file.type !== 'd')
      .orderBy('name')
      .value();
    for (const file of retryFiles) {
      try {
        file.sftpAccount = ftpConfig.username;
        await this._handleFile(file, retry, options);
      } catch (err) {
        this._jobErrorMsg(err, `${this.constructor.name}: ${retry}/${file.name} handler failed!!`, `${retry}`);
      }
    }
  }

  async _renameFile(from, to) {
    await this.ftpClient.connect(this.config.ftp);
    await this.ftpClient.rename(from, to);
  }

  _jobErrorMsg(err, content = '', source = '') {
    let msg;
    if (err.message === 'No such file') {
      msg = content;
    } else {
      msg = `${this.constructor.name}: ${source} ${err.message || err}`;
    }
    Logger.error(msg);
    if (this.xPushService) {
      this.xPushService.sendDingDing(msg);
    }
    throw new BusinessException(msg);
  }
}
