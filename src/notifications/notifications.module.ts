import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";

const mailTransporterProvider = {
  provide: "MAIL_TRANSPORTER",
  useFactory: (configService: ConfigService) => {
    return createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: configService.get("mail.user"),
        clientId: configService.get("mail.clientId"),
        clientSecret: configService.get("mail.clientSecret"),
        refreshToken: configService.get("mail.refreshToken"),
        accessToken: configService.get("mail.accessToken")
      }
    });
  },
  inject: [ConfigService]
};

@Module({
  providers: [NotificationsService, mailTransporterProvider],
  exports: [NotificationsService],
  imports: [ConfigModule]
})
export class NotificationsModule {
}
