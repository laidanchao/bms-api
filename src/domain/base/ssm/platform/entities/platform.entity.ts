import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';

@Entity('ssm_platform')
export class Platform {
  @Column('varchar', { unique: true })
  @PrimaryColumn()
  id: string;

  @Column('varchar', { nullable: true })
  note?: string;

  @Column('varchar', { nullable: true, comment: '推送SMS的产品码' })
  smsProductCode: string;

  @Column('simple-array', { nullable: true, comment: '需要推送给SMS的派送商' })
  smsTransporters: string[];

  @Column('boolean', { nullable: true, comment: '外部包裹是否需要推送SMS' })
  smsIsPushOutside: boolean;

  @Column('varchar', { nullable: true, name: 'track17_account', comment: '17track账号' })
  track17Account: string;

  @Column('varchar', { nullable: true, name: 'track17_password', comment: '17track密码' })
  track17Password: string;

  @Column('varchar', { nullable: true, name: 'track17_key', comment: '17track密钥' })
  track17Key: string;

  @OneToMany(
    () => CamChannel,
    channel => channel.platform,
  )
  channels: CamChannel[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  createdAt?: Date = new Date();

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', precision: 6 })
  updatedAt?: Date = new Date();

  @Column('boolean', { default: true })
  isActive: boolean;
}
