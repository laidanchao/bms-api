import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import moment from 'moment';

export class QueryTrackingDto {
  @IsString()
  @IsOptional()
  order: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ name: "语言, 以','为分隔符传递多种语言" })
  language: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name:
      '根据客户选择不同的数据来源，选填 TRACKING_FILE , WEBSITE , 不填时返回根据timestamp去重后的轨迹信息以轨迹文件中的优先',
  })
  dataSource: string;

  @IsOptional()
  originalText?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string = moment()
    .add(1, 'days')
    .format('YYYY-MM-DD');

  @IsString()
  @IsOptional()
  platform: string;

  // todo delete applicationToPlatform
  @IsString()
  @IsOptional()
  application: string;
}
