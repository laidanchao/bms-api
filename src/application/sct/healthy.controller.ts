import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@ApiBearerAuth()
@Controller('/api/cms/health')
export class HealthyController {
  @Get('/indicate')
  public healthIndicate(): boolean {
    return true;
  }
}
