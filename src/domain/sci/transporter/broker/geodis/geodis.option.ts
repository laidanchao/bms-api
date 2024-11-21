import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GeodisOption extends TransporterOption {
  @ApiProperty()
  @IsString()
  @IsOptional()
  deliveryOption?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contactMobileNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contactEmail?: string;
}
