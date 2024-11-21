import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({
    example: 'B1',
    description: '渠道代码,唯一',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'COLISSIMO',
  })
  @IsString()
  transporterId: string;

  @ApiProperty({
    example: '9981002631',
  })
  @IsString()
  account: string;

  @IsString()
  @IsOptional()
  subAccount?: string;

  @ApiProperty({
    example: 'COLISSIMO_FR_SIG',
  })
  @IsString()
  ftlRoute: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isSupportMulti: boolean;

  @ApiProperty({
    example: 'FTL-OMS',
  })
  @IsString()
  platform: string;

  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isSupportInsurance: boolean;

  @ApiProperty({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isUploadS3: boolean;

  @IsOptional()
  @IsBoolean()
  isClientAccount?: boolean;
}
