import { DtoOptions } from '@nestjsx/crud';
import { CreateTransporterDto } from '@/domain/sci/transporter/dto/create-transporter.dto';
import { UpdateTransporterDto } from '@/domain/sci/transporter/dto/update-transporter.dto';

export const dto: DtoOptions = {
  create: CreateTransporterDto,
  replace: UpdateTransporterDto,
};
