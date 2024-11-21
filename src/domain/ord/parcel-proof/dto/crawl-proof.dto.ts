import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { LastmileProvider } from '@/domain/utils/Enums';
import { ProofType } from '@/domain/ord/parcel-proof/entity/parcel-proof.entity';

export class CrawlProofDto {
  @IsArray()
  trackingNumbers: string[];

  @IsEnum(LastmileProvider)
  @IsOptional()
  lastmileProvider?: LastmileProvider;

  @IsString()
  proofType: ProofType;

  @IsString()
  lang: string;
}
