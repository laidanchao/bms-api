import crypto from 'crypto';
import urlEncode from 'urlencode';
export class DDRobotCrypto {
  private readonly seckey;
  private readonly timestamp;

  constructor(secKey, timestamp) {
    this.seckey = secKey;
    this.timestamp = timestamp;
  }

  /**
   * 升级加密签
   * @return {string|*}
   */
  getSignature() {
    const str = `${this.timestamp}\n${this.seckey}`;
    const hmac = crypto.createHmac('sha256', Buffer.from(this.seckey, 'utf-8'));
    hmac.update(Buffer.from(str, 'utf-8'));
    let result: Buffer | string = hmac.digest();
    result = Buffer.from(result).toString('base64');
    return urlEncode(result, 'utf-8');
  }
}
