import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { EntityRepository, getConnection, getManager, Repository } from 'typeorm';
@EntityRepository(Transporter)
export class TransporterRepository extends Repository<Transporter> {
  async getProductCodeByRoute(ftlRoute) {
    return await getConnection()
      .createQueryBuilder()
      .select('transporterProduct.productCode')
      .from(TransporterProduct, 'transporterProduct')
      .where('transporterProduct.ftlRoute = :ftlRoute', { ftlRoute: ftlRoute })
      .getOne();
  }
  async getProduct() {
    return await getConnection()
      .createQueryBuilder()
      .select('transporterProduct')
      .from(TransporterProduct, 'transporterProduct')
      .getMany();
  }

  async getAccount() {
    const rowSql = 'SELECT * FROM "transporterAccount"';
    return await getManager().query(rowSql);
  }
}
