import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '@/domain/sci/transporter/dto/create-client.dto';

export class CreateParcelDto extends CreateClientDto {
  @ApiProperty({
    example: 'clientId',
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    example: 'A1',
    description: '渠道代码',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'A4_PDF',
    description: '面单格式',
  })
  @IsString()
  labelFormat: string;

  @ApiProperty({})
  @IsString()
  @IsOptional()
  platform: string;

  // todo delete applicationToPlatform
  @ApiProperty({})
  @IsString()
  @IsOptional()
  application: string;

  @IsOptional()
  @IsObject()
  accountInfo?: any;
}
