import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { UnauthorizedException } from "@nestjs/common";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";

describe("AuthController", () => {
  let controller: AuthController;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [UsersModule, TypeOrmModule.forFeature([RefreshToken])],
      [AuthService],
      [AuthController]
    );
    cleanup = dbCleanup;

    controller = module.get<AuthController>(AuthController);
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

  describe("when signing up with valid credentials", () => {
    it("should return an access token", async () => {
      const { accessToken } = await controller.signUp({
        name: "Test User",
        email: "test@example.com",
        password: "testtesttest"
      });
      expect(accessToken).toBeDefined();
    });
  });

  describe("when refreshing an access token", () => {
    it("should return a new access token and a new refresh token", async () => {
      const { accessToken, refreshToken } = await controller.signUp({
        name: "Test User",
        email: "test@example.com",
        password: "testtesttest"
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await controller.refreshToken({
        refreshToken
      });
      expect(newAccessToken).toBeDefined();
      expect(newRefreshToken).toBeDefined();
      expect(newAccessToken).not.toEqual(accessToken);
      expect(newRefreshToken).not.toEqual(refreshToken);
    });
  });
});
