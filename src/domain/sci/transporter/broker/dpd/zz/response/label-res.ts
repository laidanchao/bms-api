import { IsString } from 'class-validator';

export class LabelRes {
  code: string;
  data: LabelResData;
  msg: string;
}

export class LabelResData {
  //提单号码
  @IsString()
  shipmentNumber: string;
  // RPX 标签的 BASE64 字符串。
  @IsString()
  rpxLabel: string;
  // RPX标签的地址。
  @IsString()
  rpxLabelUrl: string;
  // RPX面单的BASE64字符串。
  @IsString()
  rpxAwb: string;
  // RPX面单的地址。
  @IsString()
  rpxAwbUrl: string;
  // 目的地配送标签BASE64字符串。(如未转运则为空)
  @IsString()
  coloaderLabel: string;
  // 目的地配送标签的地址。(如未转运则为空)
  @IsString()
  coloaderLabelUrl: string;
  // 目的地配送号码。(如未转运则为空)
  @IsString()
  coloaderNumber: string;
}
