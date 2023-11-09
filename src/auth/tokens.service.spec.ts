import { setupTestingModule } from "../../test/test.utils";
import { TokensService } from "./tokens.service";

describe("TokenService", () => {
  let service: TokensService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [TokensService]
    );
    cleanup = dbCleanup;
    service = module.get<TokensService>(TokensService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should generate an access token", async () => {
    const accessToken = await service.generateAccessToken({ sub: "1234", name: "John Doe", email: "test@example.com" });
    expect(accessToken).toBeDefined();
  });

  it("should verify an access token", async () => {
    const accessToken = await service.generateAccessToken({ sub: "1234", name: "John Doe", email: "test@example.com" });
    const payload = await service.verifyAccessToken(accessToken);
    expect(payload).toBeDefined();
    expect(payload.sub).toEqual("1234");
  });

  it("should generate a refresh token", async () => {
    const refreshToken = await service.generateRefreshToken({ sub: "1234", name: "John Doe", email: "test@example.com" });
    expect(refreshToken).toBeDefined();
  });

  it("should verify a refresh token", async () => {
    const refreshToken = await service.generateRefreshToken({ sub: "1234", name: "John Doe", email: "test@example.com" });
    expect(refreshToken).toBeDefined();
  });
});
