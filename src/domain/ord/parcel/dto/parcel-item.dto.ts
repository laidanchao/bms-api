import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParcelItemDto {
  @ApiProperty({
    example: 'test desc',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 3,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: 3,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    example: 3,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: 'CN',
  })
  @IsString()
  originCountry?: string;

  @ApiProperty({
    example: '0402291100',
  })
  @IsString()
  hsCode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: 'EA',
  })
  @IsOptional()
  @IsString()
  unitOfMeasurement?: string;

  @ApiProperty({
    example: 'sku0001',
  })
  @IsOptional()
  @IsString()
  sku?: string;
}
