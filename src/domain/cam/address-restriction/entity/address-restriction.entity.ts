import { Column, Entity } from 'typeorm';
import { BasicEntity } from '@/domain/base/basic.entity';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { RestrictionTypeEnum } from '@/domain/cam/address-restriction/enum/restriction-type.enum';

@Entity('cam_address_restriction')
export class AddressRestriction extends BasicEntity {
  @IsString()
  @Column({ comment: '派送商', type: 'varchar' })
  transporter: string;

  @IsString()
  @Column({ comment: '平台(支持*全选或单选)', type: 'varchar' })
  platform: string;

  @IsString()
  @Column({ comment: '限制类型', type: 'varchar' })
  restrictionType: RestrictionTypeEnum;

  @IsString()
  @Column({ comment: '国家', type: 'varchar' })
  country: string;

  @IsString()
  @IsOptional()
  @Column({ comment: '类型描述', type: 'varchar' })
  description: string;

  @Column({ type: 'boolean', default: false, comment: '是否激活' })
  @IsBoolean()
  isActive: boolean;

  @IsString()
  @Column({ comment: '修改人', type: 'varchar' })
  updatedBy: string;
}
