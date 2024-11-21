import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'request-promise';

@Injectable()
export class SmService {
  config: any;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('SM');
  }

  async callback(body) {
    const data = {
      ...body,
      jobGroupName: this.config.jobGroupName,
    };
    await request({
      uri: this.config.uri,
      method: 'POST',
      json: true,
      headers: {
        Authorization: this.config.headers.Authorization,
      },
      body: data,
    });
  }
}
