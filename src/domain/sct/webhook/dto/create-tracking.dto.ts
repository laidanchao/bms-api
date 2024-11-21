import { IsOptional, IsString } from 'class-validator';

export class CreateTrackingDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  event: string;

  @IsString()
  timestamp: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
