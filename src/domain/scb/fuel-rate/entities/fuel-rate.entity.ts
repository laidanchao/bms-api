import { BasicEntity } from '@/domain/base/basic.entity';
import { Column, Entity, getRepository, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { BusinessException } from '@/app/exception/business-exception';

@Entity('scb_fuel_rate')
export class FuelRate extends BasicEntity {
  @IsString()
  @Column('varchar', { comment: '账单月' })
  month: string;

  @IsString()
  @Column('varchar')
  transporter: string;

  @IsNumber()
  @Column({
    name: 'value',
    type: 'decimal',
    precision: 28,
    scale: 6,
    comment: '燃油费率',
  })
  value: number;

  @Column('varchar', { nullable: true, comment: '账号' })
  transporterAccountId: string;

  @Column('varchar', { nullable: true, comment: '单号前缀' })
  trackingNumberPrefix: string;

  @IsBoolean()
  @IsOptional()
  @Column('bool')
  isDeleted: boolean;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @IsString()
  @IsOptional()
  @Column('varchar')
  operator: string;

  constructor(month: string, transporter: string, value: number) {
    super();
    this.month = month;
    this.transporter = transporter;
    this.value = value;
  }

  @BeforeInsert()
  async createOne() {
    const fuelRateCount = await getRepository(FuelRate).count({
      month: this.month,
      transporter: this.transporter,
      isDeleted: false,
    });
    if (fuelRateCount) {
      throw new BusinessException(`${this.transporter}${this.month} 已配置燃油费，不可重复配置`);
    }
  }
}
