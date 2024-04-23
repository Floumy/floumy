import { PublicController } from './public.controller';
import { OrgsService } from '../../orgs/orgs.service';
import { setupTestingModule } from '../../../test/test.utils';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from '../objective.entity';
import { Org } from '../../orgs/org.entity';
import { KeyResult } from '../key-result.entity';
import { Feature } from '../../roadmap/features/feature.entity';
import { OkrsService } from '../okrs.service';
import { TokensService } from '../../auth/tokens.service';
import { BipSettings } from '../../bip/bip-settings.entity';
import { Repository } from 'typeorm';
import { Timeline } from '../../common/timeline.enum';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;
  let bipSettingsRepository: Repository<BipSettings>;
  let orgRepository: Repository<Org>;
  let okrsService: OkrsService;
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
          BipSettings,
        ]),
      ],
      [OkrsService, OrgsService, TokensService, PublicService],
      [PublicController],
    );
    cleanup = dbCleanup;
    controller = module.get<PublicController>(PublicController);
    orgRepository = module.get(getRepositoryToken(Org));
    bipSettingsRepository = module.get(getRepositoryToken(BipSettings));
    okrsService = module.get<OkrsService>(OkrsService);
    org = new Org();
    org.name = 'Test Org';
    await orgRepository.save(org);
    const bipSettings = new BipSettings();
    bipSettings.isBuildInPublicEnabled = true;
    bipSettings.org = Promise.resolve(org);
    await bipSettingsRepository.save(bipSettings);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when listing the okrs', () => {
    it('should return the okrs', async () => {
      await okrsService.create(org.id, {
        objective: { title: 'Objective 1', timeline: 'this-quarter' },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });
      await okrsService.create(org.id, {
        objective: { title: 'Objective 2', timeline: 'this-quarter' },
        keyResults: [{ title: 'KR 3' }, { title: 'KR 4' }],
      });

      const okrs = await controller.listObjectives(
        org.id,
        Timeline.THIS_QUARTER,
      );

      expect(okrs).toBeDefined();
      expect(okrs.length).toBe(2);
    });
  });

  describe('when getting an objective', () => {
    it('should return the okr', async () => {
      const okr = await okrsService.create(org.id, {
        objective: { title: 'Objective 1', timeline: 'this-quarter' },
        keyResults: [{ title: 'KR 1' }, { title: 'KR 2' }],
      });

      const result = await controller.getObjective(org.id, okr.objective.id);

      expect(result).toBeDefined();
      expect(result.objective.id).toBe(okr.objective.id);
      expect(result.keyResults.length).toBe(2);
    });
  });
});
