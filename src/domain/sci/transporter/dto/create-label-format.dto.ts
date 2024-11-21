import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLabelFormatDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  transporterId: string;

  @IsString()
  code: string;

  @IsString()
  value: string;

  @IsString()
  labelType: string;

  @IsString()
  labelSize: string;

  @IsString()
  operator: string;

  @IsString()
  @IsOptional()
  comment: string;
}
