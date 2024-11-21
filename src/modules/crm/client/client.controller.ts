import { Controller, Get } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientService } from '@/modules/crm/client/client.service';
import { Client } from '@/modules/crm/client/client.entity';
import { IgnoreToken } from '@/app/decorators/ignore-token.decorator';
import { ConfigService } from '@nestjs/config';

@Crud({
  model: {
    type: Client,
  },
})
@ApiBearerAuth()
@ApiTags('client')
@Controller('/api/crm/client')
@IgnoreToken(true)
export class ClientController {
  constructor(
    private readonly service: ClientService,
    private readonly configService: ConfigService
    ) {
  }

  @Get('test')
  async test(){
    const url = this.configService.get('ccms.url');
    console.log(process.env.TYPEORM_LOGGING);
    return {
      url,
      env: process.env.TYPEORM_LOGGING,
      type: typeof process.env.TYPEORM_LOGGING
    };
  }
}
