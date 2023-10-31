import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { jwtModule } from "../../test/jwt.test-module";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        jwtModule,
        UsersModule
      ],
      providers: [AuthService]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("when signing in with valid credentials", () => {
    it("should return an access token", async () => {
      const { accessToken } = await controller.signIn({ username: "john", password: "changeme" });
      expect(accessToken).toBeDefined();
    });
  });

  describe("when signing in with invalid credentials", () => {
    it("should throw an error", async () => {
      await expect(controller.signIn({
        username: "john",
        password: "wrongpassword"
      })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("when signing up with valid credentials", () => {
    it("should return an access token", async () => {
      const { accessToken } = await controller.signUp({
        username: "test",
        password: "test"
      });
      expect(accessToken).toBeDefined();
    });
  });
});
