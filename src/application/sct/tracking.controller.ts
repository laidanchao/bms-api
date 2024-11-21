import { Crud } from '@nestjsx/crud';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { IgnoreToken } from '@/app/decorators/ignore-token.decorator';
import { ApiKeyGuard } from '@/app/guards/apiKey.guard';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';
import { CreateTrackingDto } from '@/domain/sct/webhook/dto/create-tracking.dto';
import { SiteType } from '@/domain/sct/core/dto/crawler-target-manual.dto';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';

@Crud({
  model: {
    type: Tracking,
  },
  dto: {
    create: CreateTrackingDto,
  },
  routes: {
    exclude: ['deleteOneBase', 'replaceOneBase', 'createManyBase'],
  },
})
@ApiBearerAuth()
@ApiTags('tracking')
@Controller('/api/cms/tracking')
export class TrackingController {
  constructor(
    private readonly service: TrackingService,
    private readonly trackingHandlerNewService: TrackingHandlerNewService,
  ) {}

  @Post('addTracking')
  async addTracking(@Body() data) {
    if (data.trackingNumber) {
      return await this.service.create(data);
    }
  }

  @Post('/fetchLatestTracking')
  async fetchTransporterTracking(
    @Body()
    body: {
      transporter: string;
      trackingNumbers: string[];
      type: SiteType;
      account?: string;
      subMonth?: number;
    },
  ) {
    const { transporter, trackingNumbers, account, type, subMonth } = body;
    if (type === SiteType.OSC) {
      await this.service.fetchLatestTrackingByOSC(transporter, trackingNumbers, account);
    } else {
      await this.service.validAndFetchLatestTracking(
        transporter,
        trackingNumbers,
        type === SiteType.OFFICIAL_SITE,
        subMonth,
      );
    }
  }

  /**
   * 公开接口 IgnoreToken(true)
   * webhookJwt 验证
   * webhook 轨迹接入
   * @param body
   */
  @HttpCode(200)
  @Post('/fetchWebhookTracking')
  @IgnoreToken(true)
  // @UseGuards(AuthGuard('webhookJwt'))
  async fetchWebhookTracking(@Body() body, @Request() req) {
    return await this.service.webhookTracking(body, req.headers, WEBHOOK_SOURCE.COLISSIMO);
  }

  @HttpCode(200)
  @Post('/delivengoWebhookTracking')
  @IgnoreToken(true)
  @UseGuards(ApiKeyGuard)
  async delivengoWebhookTracking(@Body() body, @Request() req) {
    return await this.service.webhookTracking(body, req.headers, WEBHOOK_SOURCE.DELIVENGO);
  }

  @HttpCode(200)
  @Post('/17TrackWebhookTracking')
  @IgnoreToken(true)
  // @UseGuards(ApiKeyGuard)
  async track17WebhookTracking(@Body() body, @Request() req) {
    return await this.service.webhookTracking(body, req.headers, WEBHOOK_SOURCE['17TRACK']);
  }

  @HttpCode(200)
  @Post('/cainiaoWebhookTracking')
  @IgnoreToken(true)
  async cainiaoWebhookTracking(@Body() body, @Request() req) {
    await this.service.webhookTrackSendToKafka(body, req.headers);
    return {
      success: true,
      needRetry: false,
    };
  }

  /**
   * 批量添加待推送轨迹
   * @param body
   */
  @Post('/batchAddTrackingPushLog')
  async batchAddTracking(@Body() body) {
    return await this.service.batchAddTrackingPushLog(body);
  }

  /**
   * 更新包裹信息（状态、上网/妥投时间等等）
   * @param body
   */
  @Post('/updateParcelInfo')
  async updateParcelInfo(@Body() body: { trackingNumbers: string[]; subMonth?: number }) {
    return await this.trackingHandlerNewService.handleTracking(body.trackingNumbers, body.subMonth);
  }
}
