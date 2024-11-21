import { BasicEntity } from '@/domain/base/basic.entity';
import { BeforeInsert, Column, Entity, getRepository } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { BusinessException } from '@/app/exception/business-exception';

@Entity('scb_surcharge_price')
export class SurchargePrice extends BasicEntity {
  @IsString()
  @Column('varchar', { comment: '账单月' })
  month: string;

  @IsString()
  @Column('varchar')
  transporter: string;

  @IsString()
  @Column('varchar', { comment: '额外费类型' })
  type: string;

  @IsString()
  @Column({ type: 'varchar', comment: '额外费' })
  value: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '国家二字码' })
  countryCode: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '备注' })
  comment: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '额外费说明' })
  description: string;

  @IsString()
  @IsOptional()
  @Column('varchar', { comment: '操作人' })
  operator: string;

  @BeforeInsert()
  async createOne() {
    const ExtraFeeCount = await getRepository(SurchargePrice).count({
      month: this.month,
      transporter: this.transporter,
      countryCode: this.countryCode || '',
      type: this.type,
    });
    if (this.type === 'T' && !this.countryCode) {
      throw new BusinessException('T类额外费国家二字码必填');
    }
    if (ExtraFeeCount) {
      throw new BusinessException(
        `${this.transporter}${this.month}${this.type}${this.countryCode || ''} 已配置金额，不可重复配置`,
      );
    }
  }
}
