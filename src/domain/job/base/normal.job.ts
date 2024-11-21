import { JobInterface } from '@/domain/job/base/job.interface';

export class NormalJob extends JobInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async handle(option?): Promise<any> {
    return Promise.resolve(undefined);
  }
}
