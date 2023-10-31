import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { jwtModule } from "../../test/jwt.test-module";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        jwtModule
      ],
      providers: [AuthService]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when signing in with valid credentials", () => {
    it("should return an access token", async () => {
      const { accessToken } = await service.signIn("john", "changeme");
      expect(accessToken).toBeDefined();
    });
  });

  describe("when signing in with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(service.signIn("john", "wrongpassword")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("when signing up with valid credentials", () => {
    it("should return an access token", async () => {
      const { accessToken } = await service.signUp("test", "test");
      expect(accessToken).toBeDefined();
    });
  });
  describe("when signing up with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(service.signUp("", "")).rejects.toThrow();
    });
  });
});
