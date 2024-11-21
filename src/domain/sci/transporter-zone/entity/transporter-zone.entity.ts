import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { TransporterZoneRouteEnum } from '@/domain/sci/transporter-zone/enum/transporter-zone-route.enum';
import { Transporter } from '@/domain/utils/Enums';

@Entity({ name: 'sci_transporter_zone' })
export class TransporterZone extends BasicEntity {
  @Column('varchar')
  transporter: Transporter;

  @Column('varchar')
  route: TransporterZoneRouteEnum;

  @Column('varchar')
  postalCode: string;

  @Column('varchar')
  city: string;

  @Column('varchar')
  operator: string;

  @Column({ type: 'boolean', comment: '是否激活' })
  active: boolean;
}
