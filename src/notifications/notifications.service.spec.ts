import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { ConfigModule } from "@nestjs/config";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let emailServiceMock: { sendMail: jest.Mock };
  beforeEach(async () => {
    emailServiceMock = {
      sendMail: jest.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: "MAIL_TRANSPORTER", useValue: emailServiceMock }],
      imports: [ConfigModule]
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when sending an activation email", () => {
    it("should send an email", async () => {
      await service.sendActivationEmail(
        "John Doe",
        "test@example.com",
        "test"
      );
      expect(emailServiceMock.sendMail).toHaveBeenCalled();
    });
  });
});
