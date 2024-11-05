import { PublicService } from './public.service';
import { OkrsService } from '../okrs.service';
import { OrgsService } from '../../orgs/orgs.service';
import { Repository } from 'typeorm';
import { Feature } from '../../roadmap/features/feature.entity';
import { UsersService } from '../../users/users.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../objective.entity';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../key-result.entity';
import { User } from '../../users/user.entity';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Timeline } from '../../common/timeline.enum';
import { Product } from '../../products/product.entity';

describe('PublicService', () => {
  let service: PublicService;
  let okrsService: OkrsService;
  let orgsRepository: Repository<Org>;
  let bipSettingsRepository: Repository<BipSettings>;
  let productsRepository: Repository<Product>;
  let org: Org;
  let product: Product;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Objective,
          Org,
          KeyResult,
          Feature,
          User,
          BipSettings,
        ]),
      ],
      [OkrsService, OrgsService, UsersService, PublicService],
    );
    cleanup = dbCleanup;
    service = module.get<PublicService>(PublicService);
    okrsService = module.get<OkrsService>(OkrsService);
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    bipSettingsRepository = module.get<Repository<BipSettings>>(
      getRepositoryToken(BipSettings),
    );
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    org = new Org();
    org.name = 'Test Org';
    await orgsRepository.save(org);
    product = new Product();
    product.name = 'Test Product';
    product.org = Promise.resolve(org);
    await productsRepository.save(product);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    bipSettings.product = Promise.resolve(product);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when listing the okrs', () => {
    it('should return an empty list when no objectives exist', async () => {
      const result = await service.listObjectives(
        org.id,
        product.id,
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return the objectives', async () => {
      await okrsService.create(org.id, product.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      await okrsService.create(org.id, product.id, {
        objective: {
          title: 'Objective 2',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 3' }, { title: 'KR 4' }],
      });
      const result = await service.listObjectives(
        org.id,
        product.id,
        Timeline.THIS_QUARTER,
      );
      expect(result.length).toEqual(2);
      expect(result[0].id).toBeDefined();
      expect(result[0].title).toEqual('Objective 1');
      expect(result[0].progress).toEqual(0);
      expect(result[0].status).toEqual('on-track');
      expect(result[0].timeline).toEqual(Timeline.THIS_QUARTER);
      expect(result[0].reference).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
    });
    it('should validate that the building in public is enabled for the org', async () => {
      const newOrg = new Org();
      newOrg.name = 'Test Org 2';
      await orgsRepository.save(newOrg);
      const newOrgBipSettings = new BipSettings();
      newOrgBipSettings.isBuildInPublicEnabled = false;
      newOrgBipSettings.org = Promise.resolve(newOrg);
      newOrgBipSettings.product = Promise.resolve(product);
      await bipSettingsRepository.save(newOrgBipSettings);
      await expect(
        service.listObjectives(newOrg.id, product.id, Timeline.THIS_QUARTER),
      ).rejects.toThrow('Building in public is not enabled');
    });
  });

  describe('when getting an objective', () => {
    it('should return the okr', async () => {
      const okr = await okrsService.create(org.id, product.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      const result = await service.getObjective(
        org.id,
        product.id,
        okr.objective.id,
      );
      expect(result).toBeDefined();
      expect(result.objective.id).toBe(okr.objective.id);
      expect(result.keyResults.length).toBe(2);
    });
    it('should validate that the building in public is enabled for the org', async () => {
      const newOrg = new Org();
      newOrg.name = 'Test Org 2';
      await orgsRepository.save(newOrg);
      const newOrgProduct = new Product();
      newOrgProduct.name = 'Test Product';
      newOrgProduct.org = Promise.resolve(newOrg);
      await productsRepository.save(newOrgProduct);
      const newOrgBipSettings = new BipSettings();
      newOrgBipSettings.isBuildInPublicEnabled = false;
      newOrgBipSettings.org = Promise.resolve(newOrg);
      newOrgBipSettings.product = Promise.resolve(product);
      await bipSettingsRepository.save(newOrgBipSettings);
      const okr = await okrsService.create(newOrg.id, newOrgProduct.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      await expect(
        service.getObjective(newOrg.id, product.id, okr.objective.id),
      ).rejects.toThrow('Building in public is not enabled');
    });
    it('should throw an error if the objective does not exist', async () => {
      const invalidUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getObjective(org.id, product.id, invalidUUID),
      ).rejects.toThrow();
    });
  });
  describe('when getting a key result', () => {
    it('should return the key result', async () => {
      const okr = await okrsService.create(org.id, product.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      const keyResult = okr.keyResults[0];
      const result = await service.getKeyResult(
        org.id,
        product.id,
        okr.objective.id,
        keyResult.id,
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(keyResult.id);
      expect(result.title).toBe(keyResult.title);
      expect(result.progress).toBe(0);
      expect(result.status).toBe('on-track');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.reference).toBeDefined();
      expect(result.features).toEqual([]);
    });
    it('should validate that the building in public is enabled for the org', async () => {
      const newOrg = new Org();
      newOrg.name = 'Test Org 2';
      await orgsRepository.save(newOrg);
      const newOrgProduct = new Product();
      newOrgProduct.name = 'Test Product';
      newOrgProduct.org = Promise.resolve(newOrg);
      await productsRepository.save(newOrgProduct);
      const newOrgBipSettings = new BipSettings();
      newOrgBipSettings.isBuildInPublicEnabled = false;
      newOrgBipSettings.org = Promise.resolve(newOrg);
      newOrgBipSettings.product = Promise.resolve(product);
      await bipSettingsRepository.save(newOrgBipSettings);
      const okr = await okrsService.create(newOrg.id, newOrgProduct.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      const keyResult = okr.keyResults[0];
      await expect(
        service.getKeyResult(
          newOrg.id,
          product.id,
          okr.objective.id,
          keyResult.id,
        ),
      ).rejects.toThrow('Building in public is not enabled');
    });
    it('should throw an error if the key result does not exist', async () => {
      const okr = await okrsService.create(org.id, product.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      const invalidUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getKeyResult(org.id, product.id, okr.objective.id, invalidUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the objective does not exist', async () => {
      const invalidUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getKeyResult(org.id, product.id, invalidUUID, invalidUUID),
      ).rejects.toThrow();
    });
    it('should throw an error if the org does not exist', async () => {
      const invalidUUID = '00000000-0000-0000-0000-000000000000';
      await expect(
        service.getKeyResult(
          invalidUUID,
          invalidUUID,
          invalidUUID,
          invalidUUID,
        ),
      ).rejects.toThrow();
    });
  });
});
