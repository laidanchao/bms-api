import { BasicEntity } from '@/domain/base/basic.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';

@Entity('sci_label_format')
@Unique(['code', 'transporterId'])
export class LabelFormat extends BasicEntity {
  @ManyToOne(
    () => Transporter,
    transporter => transporter.labelFormats,
  )
  transporter: Transporter;

  @Column('varchar')
  transporterId: string;

  @ApiProperty({
    name: 'label',
    example: 'A4',
    description: '自定义面单代码',
  })
  @IsString()
  @Column('varchar')
  code: string;

  @ApiProperty({
    name: 'value',
    description: '服务商面单代码',
  })
  @IsString()
  @Column('varchar')
  value: string;

  @ApiProperty({
    description: '面单文件类型',
  })
  @IsString()
  @Column('varchar')
  labelType: string;

  @ApiProperty({
    description: '面单尺寸',
  })
  @IsString()
  @Column('varchar')
  labelSize: string;

  @Column('varchar', { nullable: true })
  exampleUrl: string;

  @Column('varchar', { nullable: true })
  operator: string;

  @Column('varchar', { nullable: true })
  comment: string;
}
