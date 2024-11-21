import { ApiProperty } from '@nestjs/swagger';

export class DelivengoOption {
  @ApiProperty({
    description: '通知级别',
    enum: {
      1: 'Recommandation R1 (Seulement pour les supports avec AR/sans AR)',
      2: 'Recommandation R2 (Seulement pour les supports avec AR/sans AR)',
      64: 'Notification BY e-mail of Recipient',
    },
  })
  notificationLevel?: number;

  @ApiProperty({
    description: '运输费用',
  })
  deliveryFee: number;

  @ApiProperty({
    description: '清关货种类别',
    enum: {
      1: 'Cadeau',
      2: 'Document',
      3: 'Echantillon commercial',
      4: 'Retour de marchandise',
      5: 'Autre',
      6: 'Vente de marchandises',
    },
  })
  customsCategory?: number[];
}
