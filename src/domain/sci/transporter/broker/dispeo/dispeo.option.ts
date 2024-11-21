import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class DispeoOption {
  @ApiProperty({
    description: '运输费用',
  })
  shippingFee?: number;

  @ApiProperty({
    description: '清关货种类别',
    enum: {
      0: 'Cadeau', //礼物
      1: 'Echantillon', //样本
      2: 'Vente de marchandises', //商品销售
      3: 'Document', //文件
      4: 'Retour de marchandises', //退货
      5: 'Autre', //其他
    },
  })
  customsCategory?: number;

  @ApiProperty({
    description: '国际贸易术语',
  })
  incotermCode?: string;

  @ApiProperty({
    description: '寄件人EORI',
  })
  senderEORICode?: string;

  @ApiProperty({
    description: '寄件人增值税代码',
  })
  senderVATCode?: string;

  @ApiProperty({
    description: '收件人EORI',
  })
  receiverEORICode?: string;

  @ApiProperty({
    description: '收件人增值税代码',
  })
  receiverVATCode?: string;

  @ApiProperty({
    description: '代收点',
    maxLength: 10,
  })
  relayPointId: string;

  @ApiProperty({
    description: '代收点所属国家',
    maxLength: 2,
    minLength: 2,
  })
  @Length(2, 2)
  relayCountry: string;
}
