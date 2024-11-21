import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { ParcelAging } from '@/domain/ord/parcel-aging/entities/parcel-aging.entity';
import { ParcelAgingService } from '@/domain/ord/parcel-aging/parcel-aging.service';

@Crud({
  model: {
    type: ParcelAging,
  },
})
@ApiTags('parcel-aging')
@Controller('/api/cms/parcelAging')
export class ParcelAgingController {
  constructor(private readonly service: ParcelAgingService) {}
}
