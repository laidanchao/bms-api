import { IsString } from 'class-validator';

export class ShipmentInfoDto {
  @IsString()
  reference: string;
  @IsString()
  channelCode: string;
}
