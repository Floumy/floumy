import { Test, TestingModule } from '@nestjs/testing';
import { MailNotificationsService } from './mail-notifications.service';
import { ConfigModule } from '@nestjs/config';

describe('NotificationsService', () => {
  let service: MailNotificationsService;
  let emailServiceMock: { sendEmail: jest.Mock };
  beforeEach(async () => {
    emailServiceMock = {
      sendEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailNotificationsService,
        { provide: 'POSTMARK_CLIENT', useValue: emailServiceMock },
      ],
      imports: [ConfigModule],
    }).compile();

    service = module.get<MailNotificationsService>(MailNotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when sending an activation email', () => {
    it('should send an email', async () => {
      await service.sendActivationEmail('John Doe', 'test@example.com', 'test');
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });
  });
});
