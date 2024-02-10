import { Inject, Injectable } from "@nestjs/common";
import { Transporter } from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationsService {


  constructor(@Inject("MAIL_TRANSPORTER") private transporter: Transporter, private configService: ConfigService) {
  }

  async sendActivationEmail(name: string, email: string, activationToken: string) {
    await this.transporter.sendMail({
      from: this.configService.get("mail.user"),
      to: email,
      subject: "Activate your account",
      html: `
        <h1>Hello ${name}</h1>
        <p>Click <a href="${this.configService.get("app.url")}/auth/activate/${activationToken}">here</a> to activate your account</p>
      `,
      text: `Hello ${name}, click here to activate your account: ${this.configService.get("app.url")}/auth/activate/${activationToken}`
    });
  }
}
