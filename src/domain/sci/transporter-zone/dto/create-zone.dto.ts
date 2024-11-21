import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  postalCode: string;

  @IsBoolean()
  active: boolean;

  @IsString()
  route: string;

  @IsString()
  transporter: string;

  @IsOptional()
  operator?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
