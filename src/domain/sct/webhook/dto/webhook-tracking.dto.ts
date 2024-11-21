import { IsArray, IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 法邮 webhook url body参数
 */
class removalPoint {
  @IsString()
  siteName: string;

  @IsString()
  siteCode: string;

  @IsString()
  @IsOptional()
  endOfWithdrawDate: string;

  @IsString()
  address0: string;

  @IsString()
  address1: string;

  @IsString()
  address2: string;

  @IsString()
  address3: string;

  @IsString()
  zipCode: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  countryName: string;

  @IsString()
  @IsOptional()
  countryCodeISO: string;
}

class service {
  @IsBoolean()
  deliveryChoice: boolean;
}

class steps {
  @IsNumber()
  stepId: number;

  @IsString()
  @IsOptional()
  labelShort: string;

  @IsString()
  @IsOptional()
  labelLong: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  countryCodeISO: string;

  @IsDate()
  @IsOptional()
  date: Date;
}

class events {
  @IsDate()
  date: Date;

  @IsString()
  code: string;

  @IsString()
  labelLong: string;

  @IsString()
  @IsOptional()
  siteCode: string;

  @IsString()
  @IsOptional()
  siteName: string;

  @IsString()
  @IsOptional()
  siteZipCode: string;
}

export class parcelsDto {
  @IsString()
  parcelNumber: string;

  @IsString()
  @IsOptional()
  parcelNumberAVPI: string;

  @IsString()
  @IsOptional()
  parcelNumberInstance: string;

  @IsString()
  @IsOptional()
  contractNumber: string;

  // 报错尺寸，例如："0.37x0.34x0.13"
  @IsString()
  @IsOptional()
  measuredDimension: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => removalPoint)
  removalPoint: removalPoint;

  @ValidateNested()
  @IsOptional()
  @Type(() => service)
  service: service;

  @ValidateNested()
  @IsArray()
  @IsOptional()
  @Type(() => steps)
  step: steps[];

  @ValidateNested()
  @IsArray()
  @Type(() => events)
  event: events[];
}

export class WebhookTrackingDto {
  @IsString()
  @IsOptional()
  lang: string;

  @IsArray()
  @IsOptional()
  status: [];

  @ValidateNested()
  @Type(() => parcelsDto)
  parcel: parcelsDto;
}
class DelivengoSummary {
  @IsString()
  code: string;

  @IsString()
  title: string;
}
class DelivengoStatus {
  @IsString()
  status_sequence: string;

  @IsString()
  status_code: string;

  @IsDate()
  status_date: Date;

  @IsString()
  @IsOptional()
  status_label: string;

  @IsString()
  @IsOptional()
  localization_code: string;

  @IsString()
  @IsOptional()
  localization_label: string;

  @ValidateNested()
  @IsObject()
  @Type(() => DelivengoSummary)
  summary: string;
}

class DelivengoNumbersDto {
  @IsString()
  number: string;

  @IsString()
  @IsOptional()
  date_insert: string;

  @IsString()
  @IsOptional()
  date_update: string;

  @IsString()
  @IsOptional()
  final: string;

  @ValidateNested()
  @IsArray()
  @Type(() => DelivengoStatus)
  status: DelivengoStatus[];
}

export class DelivengoWebhookTrackingDto {
  @ValidateNested()
  @IsArray()
  @Type(() => DelivengoNumbersDto)
  numbers: DelivengoNumbersDto[];
}
