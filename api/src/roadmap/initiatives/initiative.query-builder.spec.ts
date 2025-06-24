import { Initiative } from './initiative.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../../orgs/org.entity';
import { User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';
import { setupTestingModule } from '../../../test/test.utils';
import { InitiativesService } from './initiatives.service';
import { UsersService } from '../../users/users.service';
import { OrgsService } from '../../orgs/orgs.service';
import { PaymentPlan } from '../../auth/payment.plan';
import { InitiativeQueryBuilder } from './initiative.query-builder';
import { OkrsService } from '../../okrs/okrs.service';
import { MilestonesService } from '../milestones/milestones.service';
import { WorkItemsService } from '../../backlog/work-items/work-items.service';
import { InitiativeFile } from './initiative-file.entity';
import { File } from '../../files/file.entity';
import { FilesService } from '../../files/files.service';
import { Sprint } from '../../sprints/sprint.entity';
import { WorkItem } from '../../backlog/work-items/work-item.entity';
import { WorkItemFile } from '../../backlog/work-items/work-item-file.entity';
import { FilesStorageRepository } from '../../files/files-storage.repository';
import { InitiativeStatus } from './initiativestatus.enum';
import { Priority } from '../../common/priority.enum';

describe('FeatureQueryBuilder', () => {
  let initiativesRepository: Repository<Initiative>;
  let orgsRepository: Repository<Org>;
  let usersRepository: Repository<User>;
  let projectsRepository: Repository<Project>;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Initiative,
          Org,
          User,
          Project,
          InitiativeFile,
          File,
          Sprint,
          WorkItem,
          WorkItemFile,
        ]),
      ],
      [
        InitiativesService,
        UsersService,
        OrgsService,
        OkrsService,
        MilestonesService,
        WorkItemsService,
        FilesService,
        FilesStorageRepository,
      ],
    );
    cleanup = dbCleanup;
    initiativesRepository = module.get<Repository<Initiative>>(
      getRepositoryToken(Initiative),
    );
    orgsRepository = module.get<Repository<Org>>(getRepositoryToken(Org));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
  });

  afterEach(async () => {
    await cleanup();
  });

  async function getTestPremiumOrgAndUser() {
    const premiumOrg = new Org();
    premiumOrg.name = 'Premium Org';
    premiumOrg.paymentPlan = PaymentPlan.PREMIUM;
    const org = await orgsRepository.save(premiumOrg);

    const premiumUser = new User(
      'Premium User',
      'premium@example.com',
      'testtesttest',
    );
    premiumUser.org = Promise.resolve(org);
    const user = await usersRepository.save(premiumUser);

    const project = new Project();
    project.name = 'Test Project';
    project.org = Promise.resolve(org);
    await projectsRepository.save(project);

    return { org, user, project };
  }

  describe('when executing a query with term and filters', () => {
    it('should return the initiatives', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const initiative = new Initiative();
      initiative.title = 'my initiative';
      initiative.description = 'my initiative description';
      initiative.status = InitiativeStatus.COMPLETED;
      initiative.priority = Priority.HIGH;
      initiative.org = Promise.resolve(org);
      initiative.project = Promise.resolve(project);
      initiative.completedAt = new Date();
      initiative.assignedTo = Promise.resolve(user);
      await initiativesRepository.save(initiative);

      const initiativeQueryBuilder = new InitiativeQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my initiative',
        },
        initiativesRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const initiatives = await initiativeQueryBuilder.execute(1, 10);
      expect(initiatives).toBeDefined();
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].id).toEqual(initiative.id);
      expect(initiatives[0].reference).toBeDefined();
      expect(initiatives[0].title).toEqual(initiative.title);
      expect(initiatives[0].priority).toEqual(initiative.priority);
      expect(initiatives[0].status).toEqual(initiative.status);
      expect(initiatives[0].createdAt).toEqual(initiative.createdAt);
      expect(initiatives[0].updatedAt).toEqual(initiative.updatedAt);
      expect(initiatives[0].assignedTo.id).toEqual(user.id);
      expect(initiatives[0].assignedTo.name).toEqual(user.name);
    });
  });

  describe('when executing a query with reference and filters', () => {
    it('should return the initiatives', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const initiative = new Initiative();
      initiative.title = 'my initiative';
      initiative.description = 'my initiative description';
      initiative.status = InitiativeStatus.COMPLETED;
      initiative.priority = Priority.HIGH;
      initiative.org = Promise.resolve(org);
      initiative.project = Promise.resolve(project);
      initiative.completedAt = new Date();
      initiative.assignedTo = Promise.resolve(user);

      const savedFeature = await initiativesRepository.save(initiative);

      const initiativeQueryBuilder = new InitiativeQueryBuilder(
        org.id,
        project.id,
        {
          reference: savedFeature.reference,
        },
        initiativesRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const initiatives = await initiativeQueryBuilder.execute(1, 10);
      expect(initiatives).toBeDefined();
      expect(initiatives.length).toEqual(1);
      expect(initiatives[0].id).toEqual(initiative.id);
      expect(initiatives[0].reference).toBeDefined();
      expect(initiatives[0].title).toEqual(initiative.title);
      expect(initiatives[0].priority).toEqual(initiative.priority);
      expect(initiatives[0].status).toEqual(initiative.status);
    });
  });

  describe('when counting the initiatives', () => {
    it('should return the count', async () => {
      const { org, user, project } = await getTestPremiumOrgAndUser();
      const initiative = new Initiative();
      initiative.title = 'my initiative';
      initiative.description = 'my initiative description';
      initiative.status = InitiativeStatus.COMPLETED;
      initiative.priority = Priority.HIGH;
      initiative.org = Promise.resolve(org);
      initiative.project = Promise.resolve(project);
      initiative.completedAt = new Date();
      initiative.assignedTo = Promise.resolve(user);
      await initiativesRepository.save(initiative);

      const initiativeQueryBuilder = new InitiativeQueryBuilder(
        org.id,
        project.id,
        {
          term: 'my initiative',
        },
        initiativesRepository,
        {
          status: ['completed'],
          priority: ['high'],
          assigneeIds: [user.id],
          completedAt: {
            start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        },
      );

      const count = await initiativeQueryBuilder.count();
      expect(count).toEqual(1);
    });
  });
});
