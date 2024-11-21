import { PartialType } from '@nestjs/mapped-types';
import { CreateTransporterDto } from '@/domain/sci/transporter/dto/create-transporter.dto';

export class UpdateTransporterDto extends PartialType(CreateTransporterDto) {}
