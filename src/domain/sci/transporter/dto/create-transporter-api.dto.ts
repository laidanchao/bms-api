import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class CreateTransporterApiDto {
  @IsString()
  transporter: string;

  @IsString()
  apiUrl: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  operator: string;
}
