import { Logger } from '@nestjs/common';

export abstract class JobInterface {
  protected constructor() {
    Logger.log(`${this.constructor.name} init successfully`);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public async execute(option?): Promise<void> {
    Logger.log(`${this.constructor.name} has been called`);
    this.handle(option)
      .then(() => {
        // 打印成功日志
        // 钉钉机器人发送执行成功提示
        // 邮件发送执行结果详情
        Logger.log(`${this.constructor.name} execute finish!!!`);
      })
      .catch(reason => {
        // 打印失败日志
        // 钉钉机器人发送执行失败提示
        // 邮件发送执行结果详情
        Logger.log(`${this.constructor.name} execute fail, reason: ${reason}`);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchParcelTrackingInfo(parcelList) {
    throw new Error('Method not implemented.');
  }

  protected abstract handle(option?);
}
