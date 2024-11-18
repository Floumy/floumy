import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerClient } from 'postmark';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('POSTMARK_CLIENT') private postmarkClient: ServerClient,
    private configService: ConfigService,
  ) {}

  async sendActivationEmail(
    name: string,
    email: string,
    activationToken: string,
  ) {
    await this.postmarkClient.sendEmail({
      From: this.configService.get('mail.user'),
      To: email,
      Subject: 'Activate your account',
      HtmlBody: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Floumy</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .container { max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            a { display: inline-block; background: #007bff; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            h2 { color: #007bff; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hey ${name.split(' ')[0]}! 🎉</h2>
            <p>Ready to stop messing around and start making things happen?</p>
            <p><b>Hit the button below to get started:</b></p>
            <p><a href="${this.configService.get(
              'app.url',
            )}/auth/activation?token=${activationToken}">Activate My Account</a></p>
            <p>Floumy’s got your back:</p>
            <ul>
              <li><b>No BS Collaboration:</b> Work smarter, not harder.</li>
              <li><b>Tools That Actually Help:</b> Get stuff done, your way.</li>
              <li><b>Support That Gives a Damn:</b> We’ve got you covered.</li>
            </ul>
            <p>Let's make some noise. Welcome aboard!</p>
            <p>Cheers,<br>Alex</p>
          </div>
        </body>
        </html>
      `,
      TextBody: `
        Hey ${name.split(' ')[0]}! 🎉

        Ready to stop messing around and start making things happen?
    
        Hit the link to get started:
        ${this.configService.get(
          'app.url',
        )}/auth/activation?token=${activationToken}
    
        Floumy’s got your back:
        - No BS Collaboration: Work smarter, not harder.
        - Tools That Actually Help: Get stuff done, your way.
        - Support That Gives a Damn: We’ve got you covered.
    
        Let's make some noise. Welcome aboard!
    
        Cheers,
        Alex`,
      MessageStream: 'outbound',
    });
  }

  async sendPasswordResetEmail(
    name: string,
    email: string,
    resetToken: string,
  ) {
    await this.postmarkClient.sendEmail({
      From: this.configService.get('mail.user'),
      To: email,
      Subject: 'Reset Your Password',
      HtmlBody: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset for Floumy</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            a {
                display: inline-block;
                background: #007bff;
                color: #ffffff !important;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            h2 {
                color: #007bff;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <h2>Reset Your Password 🛠</h2>
            <p>Dear ${name.split(' ')[0]},</p>
            <p>We received a request to reset your password for your Floumy account. No worries, you can easily set up a new one!</p>
            <p><b>Reset Your Password:</b></p>
            <p>Simply click the link below to choose a new password:</p>
            <p><a href="${this.configService.get(
              'app.url',
            )}/auth/reset-password?token=${resetToken}">Reset My Password</a></p>
            <p>If you didn't request a password reset, please ignore this email or contact us if you have any concerns.</p>
            <p>Thanks for being a part of Floumy. We're here to ensure your experience is seamless and secure.</p>
            <p>Best Regards,<br>Alex<br></p>
        </div>
        </body>
        </html>
    `,
      TextBody: `
      Reset Your Password 🛠
  
      Dear ${name.split(' ')[0]},
      
      We received a request to reset your password for your Floumy account. No worries, you can easily set up a new one!
      
      Reset Your Password:
      
      Simply use the link below to choose a new password:
      
      ${this.configService.get(
        'app.url',
      )}/auth/reset-password?token=${resetToken}
      
      If you didn't request a password reset, please ignore this email or contact us if you have any concerns.
      
      Thanks for being a part of Floumy. We're here to ensure your experience is seamless and secure.
      
      Best Regards,
      Alex`,
      MessageStream: 'outbound',
    });
  }
}
