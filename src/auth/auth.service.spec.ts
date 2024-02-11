import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UnauthorizedException } from "@nestjs/common";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { Repository } from "typeorm";
import { setupTestingModule } from "../../test/test.utils";
import { TokensService } from "./tokens.service";
import { NotificationsService } from "../notifications/notifications.service";

describe("AuthService", () => {
  let service: AuthService;
  let cleanup: () => Promise<void>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let emailServiceMock: any;

  beforeEach(async () => {

    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken])],
      [AuthService, TokensService, NotificationsService]
    );
    cleanup = dbCleanup;
    service = module.get<AuthService>(AuthService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
    emailServiceMock = module.get("POSTMARK_CLIENT");
  });

  afterEach(async () => {
    await cleanup();
    emailServiceMock.sendEmail.mockClear();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when signing in with valid credentials", () => {
    it("should return the access and refresh tokens", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "testtesttest"
      };
      await service.signUp(signUpDto);
      const { accessToken, refreshToken } = await service.signIn("john@example.com", "testtesttest");
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });
    it("should return the same refresh token if it's not expired", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "testtesttest"
      };

      const { refreshToken: originalRefreshToken } = await service.signUp(signUpDto);
      const { refreshToken: newRefreshToken } = await service.signIn("john@example.com", "testtesttest");
      expect(originalRefreshToken).toEqual(newRefreshToken);
    });
    it("should return a new refresh token if it's expired", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "testtesttest"
      };
      const { refreshToken: originalRefreshToken } = await service.signUp(signUpDto);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const refreshTokenEntity = await refreshTokenRepository.findOneByOrFail({ token: originalRefreshToken });
      refreshTokenEntity.expirationDate = new Date(Date.now() - 1000);
      await refreshTokenRepository.save(refreshTokenEntity);
      const { refreshToken: newRefreshToken } = await service.signIn("john@example.com", "testtesttest");
      expect(originalRefreshToken).not.toEqual(newRefreshToken);
    });
  });

  describe("when signing in with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(service.signIn("john", "wrongpassword")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("when signing up with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(service.signUp({ name: "", password: "", email: "" })).rejects.toThrow();
    });
  });

  describe("when signing up with valid credentials", () => {
    it("should send an activation email", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "test@example.com",
        password: "testtesttest"
      };
      await service.signUp(signUpDto);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });
  });

  describe("when refreshing an access token", () => {
    it("should return a new access token and a new refresh token", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "test@example.com",
        password: "testtesttest"
      };

      const { accessToken, refreshToken } = await service.signUp(signUpDto);
      // sleep 1 second to make sure the generate refresh token is different
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await service.refreshToken(refreshToken);
      expect(accessToken).not.toEqual(newAccessToken);
      expect(refreshToken).not.toEqual(newRefreshToken);
    });
    it("should store the new refresh token in the database", async () => {
      const signUpDto = {
        name: "John Doe",
        email: "test@example.com",
        password: "testtesttest"
      };
      const { refreshToken } = await service.signUp(signUpDto);
      // sleep 1 second to make sure the generate refresh token is different
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { refreshToken: newRefreshToken } = await service.refreshToken(refreshToken);
      const refreshTokenEntity = await refreshTokenRepository.findOneByOrFail({ token: newRefreshToken });
      expect(refreshTokenEntity).toBeDefined();
      expect(refreshTokenEntity.token).toEqual(newRefreshToken);
      expect(refreshTokenEntity.expirationDate.getTime()).toBeGreaterThan(Date.now());
      expect(newRefreshToken).not.toEqual(refreshToken);
    });
    it("should throw an error if the refresh token is invalid", async () => {
      await expect(service.refreshToken("invalid")).rejects.toThrow(UnauthorizedException);
    });
  });
});
