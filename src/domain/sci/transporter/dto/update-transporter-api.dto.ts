import { IsBoolean, IsString } from 'class-validator';

export class UpdateTransporterApiDto {
  @IsString()
  apiUrl: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  operator: string;
}
