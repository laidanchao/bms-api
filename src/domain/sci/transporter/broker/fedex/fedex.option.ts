import { TransporterOption } from '@/domain/sci/transporter/dto/transporter-option';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FedexOption extends TransporterOption {
  @ApiProperty()
  @IsString()
  @IsOptional()
  invoiceNumber?: string; //FEDEX

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentId?: string; // FEDEX

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentType?: string; // FEDEX
}
