import { setupTestingModule } from '../../test/test.utils';
import { RefreshTokensCleanerService } from './referesh-tokens-cleaner.service';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';

describe('RefreshTokensCleanerService', () => {
  let service: RefreshTokensCleanerService;
  let refreshTokensRepository: Repository<RefreshToken>;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([RefreshToken, User, Org])],
      [RefreshTokensCleanerService],
    );
    cleanup = dbCleanup;
    service = module.get<RefreshTokensCleanerService>(
      RefreshTokensCleanerService,
    );
    refreshTokensRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanTokens', () => {
    it('should clean the expired tokens', async () => {
      await refreshTokensRepository.save([
        {
          token: 'token',
          expirationDate: new Date(),
        },
      ]);
      await service.cleanTokens();
      const tokens = await refreshTokensRepository.find();
      expect(tokens.length).toEqual(0);
    });
  });
  it("shouldn't clean the non-expired tokens", async () => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1);
    await refreshTokensRepository.save([
      {
        token: 'token',
        expirationDate,
      },
    ]);
    await service.cleanTokens();
    const tokens = await refreshTokensRepository.find();
    expect(tokens.length).toEqual(1);
  });
});
