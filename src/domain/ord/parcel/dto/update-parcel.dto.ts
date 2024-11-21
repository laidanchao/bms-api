import { PartialType } from '@nestjs/mapped-types';
import { CreateParcelDto } from '@/domain/ord/parcel/dto/create-parcel.dto';

export class UpdateParcelDto extends PartialType(CreateParcelDto) {}
