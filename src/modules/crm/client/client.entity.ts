import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/app/base/basic.entity';
import { IsDateString, IsOptional, IsString } from 'class-validator';

enum ClientStatus {
  'NORMAL' = 'NORMAL',
  'FROZEN' = 'FROZEN'
}

@Entity('crm_client')
export class Client extends BasicEntity {

  @IsString()
  @Column({ type: 'varchar', comment: '客户名' })
  clientName: string;

  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', comment: '公司名' })
  companyName: string;

  @IsDateString()
  @IsOptional()
  @Column({ type: 'date', comment: '合作时间' })
  businessDate: Date;

  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', comment: '手机号' })
  phone: string;

  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', comment: '状态', default: ClientStatus.NORMAL })
  status: ClientStatus;
}
