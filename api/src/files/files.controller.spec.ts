import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FilesStorageRepository } from './files-storage.repository';
import { UsersModule } from '../users/users.module';
import { setupTestingModule } from '../../test/test.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from '../orgs/org.entity';
import { OrgsService } from '../orgs/orgs.service';
import { WorkItemsController } from '../backlog/work-items/work-items.controller';
import { UsersService } from '../users/users.service';
import { AuthModule } from '../auth/auth.module';
import { File } from './file.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../roadmap/features/feature-file.entity';
import { WorkItemsService } from '../backlog/work-items/work-items.service';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Sprint } from '../sprints/sprint.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { Project } from '../projects/project.entity';

describe('FilesController', () => {
  let controller: FilesController;
  let cleanup: () => Promise<void>;
  let org: Org;
  let project: Project;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [
        TypeOrmModule.forFeature([
          Org,
          File,
          WorkItemFile,
          FeatureFile,
          WorkItem,
          Feature,
          Sprint,
        ]),
        UsersModule,
        AuthModule,
      ],
      [FilesService, FilesStorageRepository, WorkItemsService],
      [WorkItemsController, FilesController],
    );
    cleanup = dbCleanup;

    controller = module.get<FilesController>(FilesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );
    org = await orgsService.createForUser(user);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const file = {
        originalname: 'test.txt',
        size: 4,
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
      };
      const result = await controller.uploadFile(
        org.id,
        project.id,
        file as any,
        {
          user: { org: org.id },
        },
      );
      expect(result.id).toBeDefined();
      expect(result.name).toEqual('test.txt');
      expect(result.size).toEqual(4);
      expect(result.type).toEqual('text/plain');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const file = {
        originalname: 'test.txt',
        size: 4,
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
      };
      const result = await controller.uploadFile(
        org.id,
        project.id,
        file as any,
        {
          user: { org: org.id },
        },
      );
      await controller.deleteFile(org.id, project.id, result.id, {
        user: { org: org.id },
      });

      const response = {
        status: jest.fn().mockReturnValue({ send: jest.fn() }),
        send: jest.fn(),
      };
      const request = { user: { org: org.id } };
      await controller.getFile(
        org.id,
        project.id,
        result.id,
        request,
        response,
      );
      expect(response.status).toHaveBeenCalledWith(404);
    });
  });
});
