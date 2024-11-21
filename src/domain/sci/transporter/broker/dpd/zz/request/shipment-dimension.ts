import { IsInt, IsNumber, IsString } from 'class-validator';

export class ShipmentDimension {
  @IsNumber()
  packageVolumetricWeight: number;
  @IsNumber()
  packageWeight: number;
  @IsString()
  trackingNumber: string;
  @IsInt()
  length: number;
  @IsInt()
  width: number;
  @IsInt()
  height: number;
}
