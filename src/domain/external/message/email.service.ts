import Mailer from 'nodemailer';
import imaps from 'imap-simple';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@/app/logger';

@Injectable()
export class EmailService {
  config: Record<string, any>;
  transporter: any;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.config = this.configService.get('EMAIL') || {};
    this.transporter = Mailer.createTransport(this.config);
  }

  /**
   * Send email with the message body.
   * @param {Object} mailOptions
   * @param {string} mailOptions.from
   * @param {string} mailOptions.to
   * @param {string} mailOptions.subject
   * @param {string} mailOptions.html
   * @param {array} mailOptions.attachments
   * @return {Promise}
   */
  async send(mailOptions) {
    if (!this.config.enabled) {
      Logger.info('fake send email');
      return;
    }

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * @param {Object} options
   * @param {Object} options.imap
   * @param {Object} options.folder
   * @param {Object} options.search
   * @param {Object} options.fetch
   * @returns {Promise<void>}
   */
  async read(options) {
    const client = await imaps.connect(options);
    await client.openBox(options.folder);
    return client.search(options.search, options.fetch);
  }
}
