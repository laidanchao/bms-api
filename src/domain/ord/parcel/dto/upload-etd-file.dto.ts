import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadEtdFileDto {
  @ApiProperty({
    description: '文件名称',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '文件内容,base64格式',
  })
  @IsString()
  documentContent: string;

  @ApiProperty({
    description: '收件人国家代码',
  })
  @IsString()
  destinationCountryCode: string;

  @ApiProperty({
    description: '',
  })
  @IsString()
  originCountryCode: string;

  @ApiProperty({
    description: '文件类型',
  })
  @IsString()
  documentType: string;

  @ApiProperty({
    description: '渠道代码',
  })
  @IsString()
  code: string;
}
