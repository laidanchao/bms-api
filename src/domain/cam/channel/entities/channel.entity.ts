import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';

@Entity('cam_channel')
export class CamChannel extends BasicEntity {
  @Column('varchar', { unique: true, comment: '渠道代码' })
  code: string;

  @JoinColumn({
    name: 'transporter_id',
    referencedColumnName: 'id',
  })
  @ManyToOne(() => Transporter)
  transporter: Transporter;

  @Column('varchar')
  transporterId: string;

  @Column('varchar')
  account: string;

  @JoinColumn([{ name: 'account', referencedColumnName: 'account' }])
  @ManyToOne(
    () => Account,
    account => account.channels,
  )
  accountInfo: Account;

  @JoinColumn({ name: 'ftl_route', referencedColumnName: 'ftlRoute' })
  @ManyToOne(
    () => TransporterProduct,
    product => product.channels,
    // { cascade: true }
  )
  productInfo: TransporterProduct;

  @Column('varchar')
  ftlRoute: string;

  @Column('varchar', { nullable: true, comment: '线路备注' })
  comment: string;

  @Column('boolean', { default: false })
  isActive: boolean;

  @Column('boolean', { default: false, comment: '是否支持多包裹' })
  isSupportMulti: boolean;

  @Column('varchar')
  platform: string;

  @Column('boolean', { default: false, comment: '是否支持保险' })
  isSupportInsurance: boolean;

  @Column('boolean', { default: false, comment: '是否上传s3' })
  isUploadS3: boolean;

  @Column('boolean', { default: false, comment: '是否周六送货' })
  isDeliverSat: boolean;

  @Column('varchar', { nullable: true })
  operator: string;

  @Column('boolean', { default: false, comment: '是否是客户账号下单' })
  isClientAccount: boolean;

  @Column('varchar', { nullable: true, comment: '使用寄件人默认模板' })
  senderAddressCode: string;
}
