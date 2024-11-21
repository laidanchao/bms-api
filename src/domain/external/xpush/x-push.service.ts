import Axios, { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/app/exception/business-exception';
import { MessageType, Xpush } from '@ftlab/xpush-client';

@Injectable()
export class XPushService {
  constructor(private readonly configService: ConfigService) {
  }

  async get(url: string, query) {
    const xPushConfig = this.configService.get('XPush');
    const baseURL = xPushConfig.uri;
    const params: any = {
      baseURL,
      url,
      method: 'get',
      data: query,
      responseType: 'json',
      headers: xPushConfig.headers,
    };
    try {
      const res = await Axios.request(params);
      const { data } = res;
      return data;
    } catch (e) {
      throw new BusinessException(e);
    }
  }

  async kafkaEnqueue(topic, body, kafkaKey?) {
    const xPushConfig = this.configService.get('XPush');
    const option: AxiosRequestConfig = {
      method: 'POST',
      baseURL: xPushConfig.uri,
      url: 'api/kafka/enqueue',
      responseType: 'json',
      headers: xPushConfig.headers,
      data: {
        topic,
        body,
        kafkaKey,
      },
    };
    try {
      const result = await Axios.request(option);
      return result.data;
    } catch (e) {
      throw new BusinessException(e);
    }
  }

  async sendMessage(topic: string, messageType: MessageType, content: any) {
    const config = this.configService.get('XPush2');
    const body = {
      url: config.url,
      token: config.token,
      topic,
      messageType,
      content,
    };
    return new Xpush().sendMessage(body);
  }


  /**
   * 发送钉钉消息
   * @param content
   * @param groupName
   * @param atList 需要@的手机号
   * @param atAll 是否@所有人
   */
  async sendDingDing(content, groupName = 'default', atList = [], atAll = false) {
    // 账单通知和轨迹通知有独立的群，定时器/技术报错/下单相关等通知合并到一个群
    let topic;
    switch (groupName) {
      case 'bill':
        topic = 'CMS_DING_ROBOT_BILL_PARSE';
        break;
      case 'tracking':
        topic = 'CMS_DING_ROBOT_TRACKING';
        break;
      case 'scheduler':
      case 'default':
      case 'it_robot':
        topic = 'CMS_DING_ROBOT_OTHER';
        break;
      default:
        topic = 'CMS_DING_ROBOT_OTHER';
        break;
    }

    if (!process.env.NODE_ENV.includes('production')) {
      content = `### **<font color="#00bfff">测试环境</font>** \n\n ${content}`;
    }

    return await this.sendMessage(topic, MessageType.DING_ROBOT, {
      title: groupName,
      content,
      atAll,
      atList: atAll ? [] : atList,
    });
  }
}
