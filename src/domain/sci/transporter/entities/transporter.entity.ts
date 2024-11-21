import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, Unique, UpdateDateColumn } from 'typeorm';
import { IsBoolean, IsString } from 'class-validator';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { LastmileProviderTypeEnum } from '@/domain/sci/transporter/enum/lastmileProviderType.enum';

export class AccountAttribute {
  @IsString()
  attribute: string;

  @IsBoolean()
  required: boolean;
}

export class ShipmentUrl {
  @IsString()
  environment: string;

  @IsString()
  url: string;
}

@Entity('sci_transporter')
@Unique(['id'])
export class Transporter {
  @Column('varchar', { comment: '供应商代码:全大写+下划线(GLS_ES)' })
  @PrimaryColumn()
  id: string;

  @Column('varchar', { nullable: true, comment: '供应商名称' })
  name: string;

  @Column('json')
  accountAttribute: AccountAttribute[];

  @OneToMany(
    () => TransporterProduct,
    product => product.transporter,
    { cascade: true },
  )
  transporterProducts: TransporterProduct[];

  @OneToMany(
    () => Account,
    account => account.transporter,
    { cascade: true },
  )
  transporterAccounts: Account[];

  @OneToMany(
    () => LabelFormat,
    labelFormat => labelFormat.transporter,
    { cascade: true },
  )
  labelFormats: LabelFormat[];

  @Column('numeric', { nullable: true })
  maxInsuranceValue: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column('varchar', { nullable: true })
  access_method: string;

  @Column('varchar', { name: 'carrier_code_17track', nullable: true, comment: '17track承运商code' })
  carrierCode17track: string;

  @Column('varchar', { name: 'lastmile_provider', nullable: true, comment: '尾程供应商' })
  lastmileProvider: string;

  @Column('varchar', { name: 'lastmile_provider_type', nullable: true, comment: '尾程供应商' })
  lastmileProviderType: LastmileProviderTypeEnum;
}
