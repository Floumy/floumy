import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { jwtModule } from "../../test/jwt.test-module";
import { UnauthorizedException } from "@nestjs/common";
import { typeOrmModule } from "../../test/typeorm.test-module";
import { UsersService } from "../users/users.service";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { Repository } from "typeorm";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let refreshTokenRepository: Repository<RefreshToken>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        jwtModule,
        typeOrmModule,
        TypeOrmModule.forFeature([RefreshToken])
      ],
      providers: [AuthService]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  afterEach(async () => {
    await usersService.clear();
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
      // sleep for 1 second to make sure the refresh token generated is different
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
