import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsString } from 'class-validator';
@Entity('cam_sender_address')
export class CamSenderAddress extends BasicEntity {
  @IsString()
  @Column({ comment: '更新人', type: 'varchar' })
  updatedBy: string;

  @IsString()
  @Column({ comment: '地址code，需唯一', type: 'varchar' })
  addressCode: string;

  @IsString()
  @Column({ comment: '平台', type: 'varchar' })
  platform: string;

  @IsString()
  @Column({ comment: '公司', type: 'varchar', nullable: true })
  company: string;

  @IsString()
  @Column({ comment: '邮箱', type: 'varchar' })
  email: string;

  @IsString()
  @Column({ comment: '移动电话', type: 'varchar', nullable: true })
  mobileNumber: string;

  @IsString()
  @Column({ comment: '省', type: 'varchar', nullable: true })
  province: string;

  @IsString()
  @Column({ comment: '地址1', type: 'varchar' })
  street1: string;

  @IsString()
  @Column({ comment: '地址2', type: 'varchar', nullable: true })
  street2: string;

  @IsString()
  @Column({ comment: '地址3', type: 'varchar', nullable: true })
  street3: string;

  @IsString()
  @Column({ comment: '城市', type: 'varchar' })
  city: string;

  @IsString()
  @Column({ comment: '国家', type: 'varchar' })
  countryCode: string;

  @IsString()
  @Column({ comment: '电话', type: 'varchar' })
  phoneNumber: string;

  @IsString()
  @Column({ comment: '邮编', type: 'varchar' })
  postalCode: string;

  @IsString()
  @Column({ comment: '姓', type: 'varchar' })
  lastName: string;

  @IsString()
  @Column({ comment: '名', type: 'varchar', nullable: true })
  firstName: string;
}
