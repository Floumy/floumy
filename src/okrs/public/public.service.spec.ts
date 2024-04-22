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

describe('PublicService', () => {
  let service: PublicService;
  let okrsService: OkrsService;
  let orgsRepository: Repository<Org>;
  let bipSettingsRepository: Repository<BipSettings>;
  let org: Org;
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
    org = new Org();
    org.name = 'Test Org';
    await orgsRepository.save(org);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
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
        Timeline.THIS_QUARTER,
      );
      expect(result).toEqual([]);
    });
    it('should return the objectives', async () => {
      await okrsService.create(org.id, {
        objective: {
          title: 'Objective 1',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      await okrsService.create(org.id, {
        objective: {
          title: 'Objective 2',
          timeline: Timeline.THIS_QUARTER,
        },
        keyResults: [{ title: 'KR 3' }, { title: 'KR 4' }],
      });
      const result = await service.listObjectives(
        org.id,
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
      await bipSettingsRepository.save(newOrgBipSettings);
      await expect(
        service.listObjectives(newOrg.id, Timeline.THIS_QUARTER),
      ).rejects.toThrow('Building in public is not enabled');
    });
  });
});
