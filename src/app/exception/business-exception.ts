export class BusinessException extends Error {
  constructor(message) {
    super(ErrorConstant.errorPrefix + message);
  }
}

export class ErrorConstant {
  static errorPrefix = 'FTL: ';
}
