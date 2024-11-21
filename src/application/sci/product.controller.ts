import { Crud } from '@nestjsx/crud';
import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { ProductService } from '@/domain/sci/transporter/service/product.service';

@Crud({
  model: {
    type: TransporterProduct,
  },
  query: {
    join: {
      transporter: {},
    },
  },
})
@ApiTags('product')
@Controller('/api/cms/product')
export class ProductController {
  constructor(private readonly service: ProductService) {}
}
