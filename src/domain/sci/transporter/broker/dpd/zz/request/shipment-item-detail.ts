import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ShipmentItemDetail {
  @IsString()
  @IsOptional()
  brandName: string;

  @IsString()
  contentCN: string;

  @IsString()
  contentEN: string;

  @IsString()
  @IsOptional()
  countryOfManufacture: string;

  @IsString()
  description: string;

  @IsString()
  hsCodeCN: string;

  @IsString()
  hsCodeEN: string;

  @IsNumber()
  itemWeight: number;

  @IsNumber()
  pieces: number;

  @IsNumber()
  price: number;

  @IsString()
  unitEN: string;

  @IsString()
  @IsOptional()
  productCode: string;

  @IsString()
  @IsOptional()
  unitCN: string;

  @IsString()
  @IsOptional()
  url: string;
}
