import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTransporterAccountDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  transporterId: string;

  @IsString()
  account: string;

  @IsString()
  @IsOptional()
  subAccount? = '0';

  @IsObject()
  accountInfo: Record<string, string>;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  platform?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  operator?: string;

  @IsBoolean()
  @IsOptional()
  external?: boolean;

  @IsBoolean()
  enabled: boolean;
}
