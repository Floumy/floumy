import { PublicService } from './public.service';
import { OrgsService } from '../orgs.service';
import { Repository } from 'typeorm';
import { Org } from '../org.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Product } from '../../products/product.entity';

describe('PublicService', () => {
  let service: PublicService;
  let orgsRepository: Repository<Org>;
  let bipRepository: Repository<BipSettings>;
  let productRepository: Repository<Product>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, User, BipSettings])],
      [PublicService, OrgsService],
    );
    service = module.get<PublicService>(PublicService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    bipRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    cleanup = dbCleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when getting the public org', () => {
    it('should return the public org', async () => {
      const product = new Product();
      product.name = 'Test Product';
      await productRepository.save(product);
      const org = new Org();
      org.name = 'Test Org';
      org.products = Promise.resolve([product]);
      await orgsRepository.save(org);
      const bipSettings = new BipSettings();
      bipSettings.isBuildInPublicEnabled = true;
      bipSettings.org = Promise.resolve(org);
      bipSettings.product = Promise.resolve(product);
      await bipRepository.save(bipSettings);

      const publicOrg = await service.getPublicOrg(org.id);

      expect(publicOrg).toBeDefined();
      expect(publicOrg.name).toBe('Test Org');
    });
    it('should throw an error if the org does not exist', async () => {
      await expect(service.getPublicOrg('invalid-id')).rejects.toThrow();
    });
    it('should throw an error if the org is not public', async () => {
      const product = new Product();
      product.name = 'Test Product';
      await productRepository.save(product);
      const org = new Org();
      org.name = 'Test Org';
      org.products = Promise.resolve([product]);
      await orgsRepository.save(org);

      await expect(service.getPublicOrg(org.id)).rejects.toThrow();
    });
  });
});
