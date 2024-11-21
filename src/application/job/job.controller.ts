import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Logger } from '@/app/logger';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';
import { JobInterface } from '@/domain/job/base/job.interface';
import { SmService } from '@/domain/external/scheduler/sm.service';
import { OutsideParcelListener } from '@/domain/job/order/service/outside-parcel.listener';

export enum STATE {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export enum JOB_SUCCESS {
  FAILED = 0,
  EXECUTING = 1,
  SUCCESS = 2,
}

@ApiBearerAuth()
@ApiTags('scheduler')
@Controller('/api/cms/scheduler')
export class JobController {
  constructor(private moduleRef: ModuleRef, private smService: SmService) {}

  private states = {};

  @Get('/health')
  async health() {
    return 'started';
  }

  // TODO xiewenzhen step3 将HttpMethod = 'POST'的请求, 响应状态码改成200 使用 interceptor拦截器实现
  @HttpCode(200)
  @Post('execute')
  async execute(@Body() body) {
    const { logId, executorHandler: jobName, executorParam: options = {} } = body;
    try {
      const job = this.moduleRef.get<JobInterface>(jobName);
      Logger.info(`${jobName} job previous states: ${this.states[jobName]}`);
      // 执行任务并异步返回结果
      if (this.states[jobName] !== STATE.EXECUTING) {
        this.executeAndCallback(job, jobName, options, logId)
          .then(() => Logger.info)
          .catch(Logger.info);
      } else {
        // 立刻返回现状
        const smOptions = {
          status: STATE.SUCCESS,
          message: '上一个任务仍在执行中，任务置为success',
          logId,
          success: JOB_SUCCESS.SUCCESS,
        };
        await this.smService.callback(smOptions);
      }
      Logger.info(`${jobName} job current states: ${this.states[jobName]}`);
      // 立刻返回现状
      return {
        logId,
        success: JOB_SUCCESS.SUCCESS,
        jobGroupName: 'CMS-NEST-SCHEDULER',
        jobInfoName: jobName,
      };
    } catch (e) {
      const smOptions = {
        status: STATE.FAIL,
        message: e.message,
        logId,
        success: JOB_SUCCESS.FAILED,
      };
      await this.smService.callback(smOptions);
    }
  }

  private async executeAndCallback(job, jobName, options, logId) {
    let smOptions = {
      status: STATE.SUCCESS,
      message: 'success',
      logId,
      success: JOB_SUCCESS.SUCCESS,
    };
    try {
      this.states[jobName] = STATE.EXECUTING;
      await job.execute(options);
      this.states[jobName] = STATE.SUCCESS;
    } catch (e) {
      Logger.error(e.message);
      smOptions = {
        logId,
        status: STATE.FAIL,
        message: e.message,
        success: JOB_SUCCESS.FAILED,
      };
    } finally {
      this.states[jobName] = smOptions.status;
      try {
        await this.smService.callback(smOptions);
      } catch (e) {
        console.log(`回调SM拉闸 ${e.message}`);
      }
      // do nothing
    }
  }

  @Post('updateColispriveTrackingJobStates')
  async updateColispriveTrackingJobStates() {
    if (this.states['ColispriveTrackingJob']) {
      this.states['ColispriveTrackingJob'] = undefined;
      return 'update success';
    }
    return 'ok';
  }
}
