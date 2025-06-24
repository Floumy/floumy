import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UnauthorizedException } from '@nestjs/common';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { TokensService } from './tokens.service';
import { MailNotificationsService } from '../mail-notifications/mail-notifications.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { OrgsService } from '../orgs/orgs.service';
import { Org } from '../orgs/org.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let cleanup: () => Promise<void>;
  let response: any;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken, User, Org])],
      [
        AuthService,
        TokensService,
        MailNotificationsService,
        UsersService,
        OrgsService,
      ],
      [AuthController],
    );
    cleanup = dbCleanup;

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    response = {
      cookies: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when signing in with valid credentials', () => {
    it('should return an access token', async () => {
      await controller.orgSignUp({
        orgName: 'Test project',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'testtesttest',
      });

      const user = await usersService.findOneByEmail('john@example.com');
      user.isActive = true;
      await usersService.save(user);
      const { lastSignedIn } = await controller.signIn(
        {
          email: 'john@example.com',
          password: 'testtesttest',
        },
        response,
      );
      expect(lastSignedIn).toBeDefined();
    });
  });

  describe('when signing in with invalid credentials', () => {
    it('should throw an error', async () => {
      await expect(
        controller.signIn(
          {
            email: 'john',
            password: 'wrongpassword',
          },
          response,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('when refreshing an access token', () => {
    it('should return a new access token and a new refresh token', async () => {
      await controller.orgSignUp({
        orgName: 'Test project',
        name: 'Test User',
        email: 'test@example.com',
        password: 'testtesttest',
      });

      const user = await usersService.findOneByEmail('test@example.com');
      user.isActive = true;
      await usersService.save(user);

      await controller.signIn(
        {
          email: 'test@example.com',
          password: 'testtesttest',
        },
        response,
      );
      const request = {
        cookies: {
          refreshToken: response.cookie.mock.calls[1][1],
        },
      };
      // Wait for 1 second to make sure the refresh token is regenerated
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await controller.refreshToken(request, response);
      expect(response.cookie.mock.calls[2][1]).toBeDefined();
      expect(response.cookie.mock.calls[3][1]).toBeDefined();
      expect(response.cookie.mock.calls[2][1]).not.toEqual(
        response.cookie.mock.calls[0][1],
      );
      expect(response.cookie.mock.calls[3][1]).not.toEqual(
        response.cookie.mock.calls[1][1],
      );
    });
  });

  describe('when activating an account', () => {
    it('should activate the account', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'testtesttest',
        projectName: 'Test Project',
      };
      await controller.orgSignUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.activateAccount({
        activationToken: user.activationToken,
      });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      expect(updatedUser.isActive).toBe(true);
    });
  });

  describe('when requesting a password reset', () => {
    it('should send a password reset email', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        projectName: 'Test Project',
      };
      await controller.orgSignUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.requestPasswordReset({ email: user.email });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      expect(updatedUser.passwordResetToken).toBeDefined();
    });
  });

  describe('when resetting a password', () => {
    it('should reset the password', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        projectName: 'Test Project',
      };
      await controller.orgSignUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.requestPasswordReset({ email: user.email });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      await controller.resetPassword({
        resetToken: updatedUser.passwordResetToken,
        password: 'newpassword',
      });
      const userWithNewPassword = await usersService.findOneByEmail(
        signUpDto.email,
      );
      expect(userWithNewPassword.password).not.toEqual(user.password);
    });
  });
});
