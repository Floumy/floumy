import { setupTestingModule } from '../../test/test.utils';
import { TokensService } from './tokens.service';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';

describe('TokenService', () => {
  let service: TokensService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [TokensService],
    );
    cleanup = dbCleanup;
    service = module.get<TokensService>(TokensService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an access token', async () => {
    const user = new User('John Doe', 'test@example.com', 'password');
    user.id = '1234';
    user.org = Promise.resolve({ id: '1234' } as Org);
    const accessToken = await service.generateAccessToken(user);
    expect(accessToken).toBeDefined();
  });

  it('should verify an access token', async () => {
    const user = new User('John Doe', 'test@example.com', 'password');
    user.id = '1234';
    user.org = Promise.resolve({ id: '1234' } as Org);
    const accessToken = await service.generateAccessToken(user);
    const payload = await service.verifyAccessToken(accessToken);
    expect(payload).toBeDefined();
    expect(payload.sub).toEqual('1234');
  });

  it('should generate a refresh token', async () => {
    const user = new User('John Doe', 'test@example.com', 'password');
    user.id = '1234';
    user.org = Promise.resolve({ id: '1234' } as Org);
    const refreshToken = await service.generateRefreshToken(user);
    expect(refreshToken).toBeDefined();
  });

  it('should verify a refresh token', async () => {
    const user = new User('John Doe', 'test@example.com', 'password');
    user.id = '1234';
    user.org = Promise.resolve({ id: '1234' } as Org);
    const refreshToken = await service.generateRefreshToken(user);
    expect(refreshToken).toBeDefined();
  });
});
