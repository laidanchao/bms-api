import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class CancelParcelDto {
  @IsString()
  shippingNumber: string;

  @IsArray()
  @IsOptional()
  trackingNumbers?: string[];

  @IsOptional()
  @IsObject()
  accountInfo?: any;
}
