import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { AddressRestriction } from '@/domain/cam/address-restriction/entity/address-restriction.entity';
import { AddressRestrictionService } from '@/domain/cam/address-restriction/service/address-restriction.service';

@Crud({
  model: {
    type: AddressRestriction,
  },
  query: {},
})
@Controller('/api/cms/addressRestriction')
@ApiTags('addressRestriction')
@ApiBearerAuth()
export class AddressRestrictionController {
  constructor(private readonly service: AddressRestrictionService) {}
}
