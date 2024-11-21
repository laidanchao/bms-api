import { PartialType } from '@nestjs/mapped-types';
import { CreateZoneDto } from '@/domain/sci/transporter-zone/dto/create-zone.dto';

export class UpdateZoneDto extends PartialType(CreateZoneDto) {}
