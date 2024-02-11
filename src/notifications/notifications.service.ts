import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServerClient } from "postmark";

@Injectable()
export class NotificationsService {


  constructor(
    @Inject("POSTMARK_CLIENT") private postmarkClient: ServerClient,
    private configService: ConfigService) {
  }


  async sendActivationEmail(name: string, email: string, activationToken: string) {
    await this.postmarkClient.sendEmail({
      From: this.configService.get("mail.user"),
      To: email,
      Subject: "Activate your account",
      HtmlBody: `
        <h1>Hello ${name}</h1>
        <p>Click <a href="${this.configService.get("app.url")}/auth/activate?token=${activationToken}">here</a> to activate your account</p>
      `,
      TextBody: `Hello ${name}, click here to activate your account: ${this.configService.get("app.url")}/auth/activate?token=${activationToken}`,
      MessageStream: "outbound"
    });
  }
}
