import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { Page } from './pages.entity';
import { Project } from '../projects/project.entity';
import { CreatePageDto } from './pages.dtos';
import { setupTestingModule } from '../../test/test.utils';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Org } from '../orgs/org.entity';
import { OrgsService } from '../orgs/orgs.service';
import { UsersService } from '../users/users.service';

describe('PagesController', () => {
  let controller: PagesController;
  let project: Project;
  let org: Org;
  let user: User;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Page, Project, User]), AuthModule],
      [PagesService],
      [PagesController],
    );
    cleanup = dbCleanup;
    controller = module.get<PagesController>(PagesController);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const orgsRepository = module.get(getRepositoryToken(Org));
    user = await usersService.createUserWithOrg(
      'Test User',
      'test@example.com',
      'testtesttest',
    );

    org = await orgsService.createForUser(user);
    org.users = Promise.resolve([user]);
    await orgsRepository.save(org);
    project = (await org.projects)[0];
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should create a page', async () => {
    const dto: CreatePageDto = { parentId: null };
    const result = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title', null);
    expect(result).toHaveProperty('content', null);
  });

  it('should get pages by root parent', async () => {
    const dto: CreatePageDto = { parentId: null };
    const page = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const secondPage = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: null },
    });
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('id', page.id);
    expect(result[1]).toHaveProperty('id', secondPage.id);
  });

  it('should get pages by parent', async () => {
    const dto: CreatePageDto = { parentId: null };
    const page = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const childDto: CreatePageDto = { parentId: page.id };
    const childPage = await controller.createPage(
      org.id,
      project.id,
      childDto,
      {
        user: { org: org.id, id: user.id },
      },
    );
    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: page.id },
    });
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('id', childPage.id);
    expect(result[0]).toHaveProperty('hasChildren', false);
  });

  it('should expose when a root page has children', async () => {
    const parentPage = await controller.createPage(
      org.id,
      project.id,
      { parentId: null },
      {
        user: { org: org.id, id: user.id },
      },
    );

    await controller.createPage(
      org.id,
      project.id,
      { parentId: parentPage.id },
      {
        user: { org: org.id, id: user.id },
      },
    );

    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: null },
    });

    expect(result[0]).toHaveProperty('id', parentPage.id);
    expect(result[0]).toHaveProperty('hasChildren', true);
  });

  it('should search pages by title', async () => {
    const dto: CreatePageDto = { parentId: null };
    await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const secondPage = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });

    await controller.updatePage(
      org.id,
      project.id,
      secondPage.id,
      {
        user: { org: org.id, id: user.id },
      },
      { title: 'Searchable Page', content: 'Some content' },
    );

    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { search: 'Searchable' },
    });
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('id', secondPage.id);
  });

  it('should update a page', async () => {
    const dto: CreatePageDto = { parentId: null };
    const page = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const updateDto = { title: 'Updated Title', content: 'Updated Content' };
    await controller.updatePage(
      org.id,
      project.id,
      page.id,
      {
        user: { org: org.id, id: user.id },
      },
      updateDto,
    );
    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: null },
    });
    expect(result[0]).toHaveProperty('id', page.id);
    expect(result[0]).toHaveProperty('title', 'Updated Title');
    expect(result[0]).toHaveProperty('content', 'Updated Content');
  });
  it('should get a page with ancestor ids and slug', async () => {
    const rootPage = await controller.createPage(
      org.id,
      project.id,
      { parentId: null },
      {
        user: { org: org.id, id: user.id },
      },
    );

    const childPage = await controller.createPage(
      org.id,
      project.id,
      { parentId: rootPage.id },
      {
        user: { org: org.id, id: user.id },
      },
    );

    await controller.updatePage(
      org.id,
      project.id,
      rootPage.id,
      {
        user: { org: org.id, id: user.id },
      },
      { title: 'Root Page' },
    );

    const result = await controller.getPage(org.id, project.id, childPage.id, {
      user: { org: org.id, id: user.id },
    });

    expect(result).toHaveProperty('id', childPage.id);
    expect(result).toHaveProperty('slug', 'untitled');
    expect(result).toHaveProperty('hasChildren', false);
    expect(result).toHaveProperty('ancestorIds', [rootPage.id]);
  });

  it('should persist empty title and content updates', async () => {
    const page = await controller.createPage(
      org.id,
      project.id,
      { parentId: null },
      {
        user: { org: org.id, id: user.id },
      },
    );

    await controller.updatePage(
      org.id,
      project.id,
      page.id,
      {
        user: { org: org.id, id: user.id },
      },
      { title: 'Temporary title', content: 'Temporary content' },
    );

    await controller.updatePage(
      org.id,
      project.id,
      page.id,
      {
        user: { org: org.id, id: user.id },
      },
      { title: '', content: '' },
    );

    const result = await controller.getPage(org.id, project.id, page.id, {
      user: { org: org.id, id: user.id },
    });

    expect(result).toHaveProperty('title', null);
    expect(result).toHaveProperty('content', '');
    expect(result).toHaveProperty('slug', 'untitled');
  });

  it('should normalize whitespace-only titles to null', async () => {
    const page = await controller.createPage(
      org.id,
      project.id,
      { parentId: null },
      {
        user: { org: org.id, id: user.id },
      },
    );

    await controller.updatePage(
      org.id,
      project.id,
      page.id,
      {
        user: { org: org.id, id: user.id },
      },
      { title: '   ' },
    );

    const result = await controller.getPage(org.id, project.id, page.id, {
      user: { org: org.id, id: user.id },
    });

    expect(result).toHaveProperty('title', null);
    expect(result).toHaveProperty('slug', 'untitled');
  });

  it('should delete a page', async () => {
    const dto: CreatePageDto = { parentId: null };
    const page = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    await controller.deletePage(org.id, project.id, page.id, {
      user: { org: org.id, id: user.id },
    });
    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: null },
    });
    expect(result).toHaveLength(0);
  });
  it('should move a page', async () => {
    const dto: CreatePageDto = { parentId: null };
    const page = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const secondPage = await controller.createPage(org.id, project.id, dto, {
      user: { org: org.id, id: user.id },
    });
    const updateDto = { parentId: secondPage.id };
    await controller.updatePage(
      org.id,
      project.id,
      page.id,
      {
        user: { org: org.id, id: user.id },
      },
      updateDto,
    );
    const result = await controller.getPagesByParent(org.id, project.id, {
      user: { org: org.id, id: user.id },
      query: { parentId: secondPage.id },
    });
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('id', page.id);
  });

  it('should reject moving a page into its own descendant', async () => {
    const rootPage = await controller.createPage(
      org.id,
      project.id,
      { parentId: null },
      {
        user: { org: org.id, id: user.id },
      },
    );
    const childPage = await controller.createPage(
      org.id,
      project.id,
      { parentId: rootPage.id },
      {
        user: { org: org.id, id: user.id },
      },
    );

    await expect(
      controller.updatePage(
        org.id,
        project.id,
        rootPage.id,
        {
          user: { org: org.id, id: user.id },
        },
        { parentId: childPage.id },
      ),
    ).rejects.toThrow();
  });
});
