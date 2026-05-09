import { Injectable } from '@nestjs/common';
import { EmailHelper } from '@src/app/helpers';
import { toBool, toNumber } from '@src/shared';
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';
import { ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE } from '../enums';
import { EmailGatewayService } from './emailGateway.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailGatewayService: EmailGatewayService,
    private readonly emailHelper: EmailHelper,
  ) { }

  async sendEmailThroughDefaultGateway(options: SendMailOptions): Promise<any> {
    // if (!ENV.isProduction) {
    //   options.to = 'emon@uniclients.com';
    // }
    console.info(
      `🚀 ~ EmailService ~ ~ sendEmailThroughDefaultGateway:========:======== ${options.to} :========:======== ${options.subject} :========:========`,
    );
    try {
      const defaultEmailGateway = await this.emailGatewayService.findOne({
        where: {
          accountType: ENUM_EMAIL_GATEWAY_ACCOUNT_TYPE.DEFAULT,
          isActive: true,
        },
      });

      if (!defaultEmailGateway) {
        console.error('========= DEFAULT EMAIL GATEWAY NOT FOUND =========');
        return;
      }

      const transporter = nodemailer.createTransport({
        host: defaultEmailGateway.host,
        port: toNumber(defaultEmailGateway.port),
        secure: toBool(defaultEmailGateway.isSecure),
        auth: {
          user: defaultEmailGateway.authUser,
          pass: defaultEmailGateway.authPassword,
        },
      });

      const html = await this.emailHelper.createEmailContent(
        {
          body: options.html,
          // loginLink: ENV.webPanel.loginLink,
          copyRightYear: new Date().getFullYear(),
        },
        'email',
      );

      const sendMailPayload = {
        from: `${defaultEmailGateway?.senderLabel || 'Fibonacci Books'} <${defaultEmailGateway.senderEmail}>`,
        ...options,
        html: html,
      };

      const res = await transporter.sendMail(sendMailPayload);

      console.info('🚀 ~ EmailService ~ sendEmailThroughDefaultGateway ~ res:', res?.response);

      return res?.response;
    } catch (error) {
      console.error('🚀 ~ ~ EmailService ~ sendEmailThroughDefaultGateway ~ error:', error);
    }
  }

  // private getGmailService(): any {
  //   const { clientId, clientSecret } = ENV.mail.gmail;
  //   const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  //   oAuth2Client.setCredentials(ENV.mail.gmail.tokens);
  //   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  //   return gmail;
  // }

  // private encodeMessage(message): string {
  //   return Buffer.from(message)
  //     .toString('base64')
  //     .replace(/\+/g, '-')
  //     .replace(/\//g, '_')
  //     .replace(/=+$/, '');
  // }

  // private async createMail(options): Promise<string> {
  //   const mailComposer = new MailComposer(options);
  //   const message = await mailComposer.compile().build();
  //   return this.encodeMessage(message);
  // }
}
