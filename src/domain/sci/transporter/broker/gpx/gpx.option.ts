import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class GPXOption {
  @ApiProperty({
    description: '发票号',
  })
  @IsOptional()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({
    description: '发票日期',
  })
  @IsOptional()
  @IsString()
  invoiceDate: string;

  @ApiProperty({
    description: '取货日期',
  })
  @IsOptional()
  @IsString()
  removalDate: string;
}
