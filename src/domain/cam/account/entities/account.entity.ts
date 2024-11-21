import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { BasicEntity } from '@/domain/base/basic.entity';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';

@Entity('cam_account')
@Unique(['account'])
export class Account extends BasicEntity {
  @ManyToOne(
    () => Transporter,
    transporter => transporter.transporterAccounts,
  )
  transporter: Transporter;

  @Column('varchar')
  transporterId: string;

  @Column('varchar')
  account: string;

  @Column('json')
  accountInfo: Record<string, string>;

  @Column('varchar', { nullable: true })
  operator: string;

  @JoinColumn({ name: 'account', referencedColumnName: 'account' })
  @OneToMany(
    () => CamChannel,
    channel => channel.accountInfo,
  )
  channels: CamChannel[];

  @Column('varchar', { nullable: true, comment: '备注信息' })
  comment: string;

  @Column('varchar', { nullable: true })
  platform: string;

  @Column('boolean', { comment: '是否是外部账号标识: t-是, f-否', default: false })
  external: boolean;

  @Column('boolean', { comment: '是否已启用' })
  enabled: boolean;
}
