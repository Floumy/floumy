import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { setupTestingModule } from '../../test/test.utils';
import { TokensService } from './tokens.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Org } from '../orgs/org.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { OrgsService } from '../orgs/orgs.service';
import { PaymentPlan } from './payment.plan';

describe('AuthService', () => {
  let service: AuthService;
  let cleanup: () => Promise<void>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let emailServiceMock: any;
  let usersService: UsersService;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken, User, Org])],
      [
        AuthService,
        TokensService,
        NotificationsService,
        UsersService,
        OrgsService,
      ],
    );
    cleanup = dbCleanup;
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    emailServiceMock = module.get('POSTMARK_CLIENT');
  });

  afterEach(async () => {
    await cleanup();
    emailServiceMock.sendEmail.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when signing in with valid credentials', () => {
    it('should return the access and refresh tokens', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('john@example.com');
      user.isActive = true;
      await usersService.save(user);
      const { accessToken, refreshToken } = await service.signIn(
        'john@example.com',
        'testtesttest',
      );
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });
    it('should not allow to sign in with an inactive account', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      await expect(
        service.signIn('john@example.com', 'testtesttest'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('when signing in with invalid credentials', () => {
    it('should throw an error', async () => {
      await expect(service.signIn('john', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('when signing up with invalid credentials', () => {
    it('should throw an error', () => {
      expect(
        service.signUp({ name: '', password: '', email: '' }),
      ).rejects.toThrow();
    });
  });

  describe('when signing up with valid credentials', () => {
    it('should send an activation email', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });
    it('should store the activation token in the database', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('test@example.com');
      expect(user.activationToken).toBeDefined();
    });
    it('should create the org if the product name is provided', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'testing@example.com',
        password: 'testtesttest',
        productName: 'Test Product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('testing@example.com');
      const org = await user.org;
      expect(org).toBeDefined();
      expect(org.name).toEqual('Test Product');
    });
    it('should create the org with the provided plan', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        productName: 'Test Product',
        plan: PaymentPlan.BUILD_IN_PRIVATE,
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('john.doe@example.com');
      const org = await user.org;
      expect(org).toBeDefined();
      expect(org.paymentPlan).toEqual(PaymentPlan.BUILD_IN_PRIVATE);
    });
    it('should throw an error if the plan is not provided', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        productName: 'Test Product',
        plan: 'invalid' as PaymentPlan,
      };
      await expect(service.signUp(signUpDto)).rejects.toThrow();
    });
  });

  describe('when refreshing an access token', () => {
    it('should return a new access token and a new refresh token', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };

      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('test@example.com');
      user.isActive = true;
      await usersService.save(user);
      const { refreshToken, accessToken } = await service.signIn(
        'test@example.com',
        'testtesttest',
      );
      // sleep 1 second to make sure the generate refresh token is different
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await service.refreshToken(refreshToken);
      expect(accessToken).not.toEqual(newAccessToken);
      expect(refreshToken).not.toEqual(newRefreshToken);
    });
    it('should store the new refresh token in the database', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('test@example.com');
      user.isActive = true;
      await usersService.save(user);
      const { refreshToken } = await service.signIn(
        'test@example.com',
        'testtesttest',
      );
      // sleep 1 second to make sure the generate refresh token is different
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { refreshToken: newRefreshToken } =
        await service.refreshToken(refreshToken);
      const refreshTokenEntity = await refreshTokenRepository.findOneByOrFail({
        token: newRefreshToken,
      });
      expect(refreshTokenEntity).toBeDefined();
      expect(refreshTokenEntity.token).toEqual(newRefreshToken);
      expect(refreshTokenEntity.expirationDate.getTime()).toBeGreaterThan(
        Date.now(),
      );
      expect(newRefreshToken).not.toEqual(refreshToken);
    });

    it('should throw an error if the refresh token is invalid', async () => {
      await expect(service.refreshToken('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if the user is not active', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail('john@example.com');
      user.isActive = true;
      await usersService.save(user);
      const { refreshToken } = await service.signIn(
        'john@example.com',
        'testtesttest',
      );
      user.isActive = false;
      await usersService.save(user);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    describe('when activating an account', () => {
      it('should activate the account', async () => {
        const signUpDto = {
          name: 'John Doe',
          email: 'test@example.com',
          password: 'testtesttest',
          productName: 'Test product',
        };
        await service.signUp(signUpDto);
        const user = await usersService.findOneByEmail(signUpDto.email);
        await service.activateAccount(user.activationToken);
        const activatedUser = await usersService.findOneByEmail(
          signUpDto.email,
        );
        expect(activatedUser.isActive).toBe(true);
      });
      it('should throw an error if the activation token is invalid', async () => {
        await expect(service.activateAccount('invalid')).rejects.toThrow(Error);
      });
    });
  });

  describe('when resetting a password', () => {
    it('should send a password reset email', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      await service.requestPasswordReset(signUpDto.email);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });
  });

  describe('when setting a new password', () => {
    it('should set a new password', async () => {
      const signUpDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testtesttest',
        productName: 'Test product',
      };
      await service.signUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      user.passwordResetToken = 'test';
      await usersService.save(user);
      await service.resetPassword('newpassword', 'test');
      const userWithNewPassword = await usersService.findOneByEmail(
        signUpDto.email,
      );
      expect(userWithNewPassword.password).not.toEqual(user.password);
    });
  });
});
