import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UnauthorizedException } from "@nestjs/common";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { TokensService } from "./tokens.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";
import { OrgsService } from "../orgs/orgs.service";
import { Org } from "../orgs/org.entity";

describe("AuthController", () => {
  let controller: AuthController;
  let usersService: UsersService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken, User, Org])],
      [AuthService, TokensService, NotificationsService, UsersService, OrgsService],
      [AuthController]
    );
    cleanup = dbCleanup;

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("when signing in with valid credentials", () => {
    it("should return an access token", async () => {
      await controller.signUp({ name: "John Doe", email: "john@example.com", password: "testtesttest" });
      const user = await usersService.findOneByEmail("john@example.com");
      user.isActive = true;
      await usersService.save(user);
      const { accessToken } = await controller.signIn({ email: "john@example.com", password: "testtesttest" });
      expect(accessToken).toBeDefined();
    });
  });

  describe("when signing in with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(controller.signIn({
        email: "john",
        password: "wrongpassword"
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("when refreshing an access token", () => {
    it("should return a new access token and a new refresh token", async () => {
      await controller.signUp({
        name: "Test User",
        email: "test@example.com",
        password: "testtesttest"
      });

      const user = await usersService.findOneByEmail("test@example.com");
      user.isActive = true;
      await usersService.save(user);

      const { accessToken, refreshToken } = await controller.signIn({
        email: "test@example.com",
        password: "testtesttest"
      });

      // Wait for 1 second to make sure the refresh token is regenerated
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await controller.refreshToken({
        refreshToken
      });
      expect(newAccessToken).toBeDefined();
      expect(newRefreshToken).toBeDefined();
      expect(newAccessToken).not.toEqual(accessToken);
      expect(newRefreshToken).not.toEqual(refreshToken);
    });
  });

  describe("when activating an account", () => {
    it("should activate the account", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "test@example.com",
        password: "testtesttest"
      };
      await controller.signUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.activateAccount({ activationToken: user.activationToken });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      expect(updatedUser.isActive).toBe(true);
    });
  });

  describe("when requesting a password reset", () => {
    it("should send a password reset email", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "testtesttest"
      };
      await controller.signUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.requestPasswordReset({ email: user.email });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      expect(updatedUser.passwordResetToken).toBeDefined();
    });
  });

  describe("when resetting a password", () => {
    it("should reset the password", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "testtesttest"
      };
      await controller.signUp(signUpDto);
      const user = await usersService.findOneByEmail(signUpDto.email);
      await controller.requestPasswordReset({ email: user.email });
      const updatedUser = await usersService.findOneByEmail(signUpDto.email);
      await controller.resetPassword({
        resetToken: updatedUser.passwordResetToken,
        password: "newpassword"
      });
      const userWithNewPassword = await usersService.findOneByEmail(signUpDto.email);
      expect(userWithNewPassword.password).not.toEqual(user.password);
    });
  });
});
