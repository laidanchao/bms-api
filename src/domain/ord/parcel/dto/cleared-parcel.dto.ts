import { IsDate, IsString } from 'class-validator';

export class ClearedParcelDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  event: string;

  @IsDate()
  clearedAt: Date;

  @IsString()
  location: string;
}
