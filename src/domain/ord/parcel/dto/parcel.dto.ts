import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParcelItemDto } from '@/domain/ord/parcel/dto/parcel-item.dto';
import { Type } from 'class-transformer';
import { ParcelOption } from '@/domain/ord/dto/parcel.option';

export class ParcelDto {
  @ApiProperty({
    description: '客户包裹单号',
    example: 'ref 123456',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({
    description: '包裹重量,单位kg',
    example: 5,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    description: '包裹体积长度,单位cm',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  length?: number;

  @ApiProperty({
    description: '包裹体积宽度,单位cm',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: '包裹体积高度,单位cm',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    type: [ParcelItemDto],
  })
  @IsArray()
  @IsOptional()
  @Type(() => ParcelItemDto)
  @ValidateNested({ each: true })
  items?: ParcelItemDto[];

  @ApiProperty({
    example: 10,
    description: '保险金额',
  })
  @IsNumber()
  @IsOptional()
  insuranceValue?: number = 0;

  @ApiProperty()
  @IsOptional()
  options?: ParcelOption = {};

  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({
    description: '包裹价值',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  value?: number;
}
