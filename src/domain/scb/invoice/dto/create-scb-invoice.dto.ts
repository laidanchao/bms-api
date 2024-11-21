import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateScbInvoiceDto {
  @IsString()
  @IsOptional()
  platform: string;

  @IsString()
  transporter: string;

  @IsString()
  billType: string;

  @IsString()
  originalFileUrl: string; // s3 的文件路径

  @IsString()
  name: string; // 文件名

  @IsNumber()
  size: number; // 文件大小

  @IsString()
  operator: string;

  @IsString()
  month: string;

  @IsOptional()
  @IsNumber()
  id: number;
}
