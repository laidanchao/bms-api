import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TransporterOption {
  enableCustomLogo?: boolean = false;
  labelLogoUrl?: string;
  signDelivery?: boolean; // 签字后交货

  @ApiProperty({
    description: '是否置换收件人寄件人',
  })
  swapAddress?: boolean;

  @ApiProperty({
    description: '自画单单号',
  })
  trackingNumber?: string;

  @ApiProperty({
    description: 'MR collectionMode',
  })
  @IsOptional()
  collectionMode?: any;

  @ApiProperty({
    description: 'Chronopost as field',
  })
  @IsOptional()
  as?: any;

  @ApiProperty({
    description: '包裹类型',
  })
  @IsOptional()
  packingType?: string;

  @ApiProperty({
    description: '是否使用无纸化清关V3服务',
  })
  @IsOptional()
  isPaperLess?: boolean;

  @ApiProperty({
    description: '是否使用默认寄件人模板',
  })
  @IsOptional()
  @IsBoolean()
  useSenderAddress?: boolean;

  @IsOptional()
  @IsString()
  applicationRequest?: string; // 客户下单请求体

  @IsOptional()
  @IsString()
  traceId?: string; // 客户日志id
}
