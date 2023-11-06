import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UnauthorizedException } from "@nestjs/common";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { Repository } from "typeorm";
import { setupTestingModule } from "../../test/test.utils";

describe("AuthService", () => {
  let service: AuthService;
  let cleanup: () => Promise<void>;
  let refreshTokenRepository: Repository<RefreshToken>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken])],
      [AuthService]
    );
    cleanup = dbCleanup;
    service = module.get<AuthService>(AuthService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when signing in with valid credentials", () => {
    it("should return the access and refresh tokens", async () => {
      await service.signUp("John Doe", "john@example.com", "testtesttest");
      const { accessToken, refreshToken } = await service.signIn("john@example.com", "testtesttest");
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });
    it("should return the same refresh token if it's not expired", async () => {
      const { refreshToken: originalRefreshToken } = await service.signUp("John Doe", "john@example.com", "testtesttest");
      const { refreshToken: newRefreshToken } = await service.signIn("john@example.com", "testtesttest");
      expect(originalRefreshToken).toEqual(newRefreshToken);
    });
    it("should return a new refresh token if it's expired", async () => {
      const { refreshToken: originalRefreshToken } = await service.signUp("John Doe", "john@example.com", "testtesttest");
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
      await expect(service.signUp("", "", "")).rejects.toThrow();
    });
  });
});
