import { Body, Controller, Post } from '@nestjs/common';
import { CainiaoBroker } from '@/domain/sci/transporter/broker/cainiao/cainiao.broker';
import { Track17Util } from '@/domain/sct/webhook/utils/track17.utils';

@Controller('/api/cms/test')
export class TestController {
  @Post('/getCaiNiaoEncodeData')
  public getCaiNiaoEncodeData(@Body() body: { token: string; data: any }) {
    return new CainiaoBroker().encodeData(body.token, body.data);
  }

  @Post('/register17')
  public register17(
    @Body() body: { trackingNumber: string; receiverPostalCode: string; carrierCode17track: string; apiKey: string },
  ) {
    return Track17Util.register(
      [
        {
          trackingNumber: body.trackingNumber,
          receiverPostalCode: body.receiverPostalCode,
          carrierCode17track: body.carrierCode17track,
        },
      ],
      body.apiKey,
    );
  }
}
