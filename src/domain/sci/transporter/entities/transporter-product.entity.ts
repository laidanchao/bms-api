import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';

@Entity('sci_transporter_product')
export class TransporterProduct extends BasicEntity {
  @ManyToOne(
    () => Transporter,
    transporter => transporter.transporterProducts,
    { primary: true },
  )
  transporter: Transporter;

  @Column('varchar')
  transporterId: string;

  @Column('varchar')
  productCode: string;

  @Column('varchar', { nullable: true })
  name: string;

  @Column('varchar', { unique: true })
  ftlRoute: string;

  @Column('varchar', { nullable: true })
  operator: string;

  @JoinColumn({ name: 'ftl_route', referencedColumnName: 'ftlRoute' })
  @OneToMany(
    () => CamChannel,
    channel => channel.productInfo,
  )
  channels: CamChannel[];
}
