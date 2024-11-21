import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class Create_applicationDto {
  @IsString()
  id: string;

  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  smsProductCode: string;

  @IsArray()
  @IsOptional()
  smsTransporters: string[];

  @IsBoolean()
  smsIsPushOutside: boolean;

  @IsOptional()
  @IsString()
  track17Account: string;

  @IsOptional()
  @IsString()
  track17Password: string;

  @IsOptional()
  @IsString()
  track17Key: string;
}
