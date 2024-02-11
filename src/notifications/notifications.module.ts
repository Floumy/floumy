import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServerClient } from "postmark";

const postmarkClientProvider = {
  provide: "POSTMARK_CLIENT",
  useFactory: (configService: ConfigService) => {
    // This is a workaround to avoid creating the provider if the API key is not set
    // which is the case when running tests
    if (!configService.get("mail.postmarkApiKey")) {
      return null;
    }
    return new ServerClient(configService.get("mail.postmarkApiKey"));
  },
  inject: [ConfigService]
};

@Module({
  providers: [NotificationsService, postmarkClientProvider],
  exports: [NotificationsService],
  imports: [ConfigModule]
})
export class NotificationsModule {
}
