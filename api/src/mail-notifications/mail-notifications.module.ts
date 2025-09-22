import { Module } from '@nestjs/common';
import { MailNotificationsService } from './mail-notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerClient } from 'postmark';

const postmarkClientProvider = {
  provide: 'POSTMARK_CLIENT',
  useFactory: (configService: ConfigService) => {
    if (!configService.get('mail.enabled')) {
      return {
        sendEmail: async () => {
          // No-op in development
        },
      };
    }
    // This is a workaround to avoid creating the provider if the API key is not set
    // which is the case when running tests
    if (!configService.get('mail.postmarkApiKey')) {
      return {
        sendEmail: async () => {
          console.error('Email not sent because the API key is not set');
        },
      };
    }
    return new ServerClient(configService.get('mail.postmarkApiKey'));
  },
  inject: [ConfigService],
};

@Module({
  providers: [MailNotificationsService, postmarkClientProvider],
  exports: [MailNotificationsService],
  imports: [ConfigModule],
})
export class MailNotificationsModule {}
