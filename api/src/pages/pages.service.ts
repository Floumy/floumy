import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { Page } from './pages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { CreatePageDto, UpdatePageDto } from './pages.dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private eventEmitter: EventEmitter2,
  ) {}

  private normalizeTitle(title?: string | null) {
    if (title == null) {
      return null;
    }

    const normalizedTitle = title.trim();
    return normalizedTitle.length > 0 ? normalizedTitle : null;
  }

  private toSlug(title?: string | null) {
    const slug = (this.normalizeTitle(title) ?? 'untitled')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'untitled';
  }

  private toPageDto(page: Page, ancestorIds: string[] = []) {
    const pageWithCounts = page as Page & { childCount?: number };

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      parentId: page.parentId,
      hasChildren: (pageWithCounts.childCount ?? 0) > 0,
      ancestorIds,
    };
  }

  private async getProjectOrFail(orgId: string, projectId: string) {
    return this.projectRepository.findOne({
      where: {
        id: projectId,
        org: { id: orgId },
      },
    });
  }

  private async getPageOrFail(
    projectId: string,
    id: string,
    withParent = false,
  ) {
    const page = await this.pageRepository.findOne({
      where: {
        id,
        project: { id: projectId },
      },
      relations: withParent ? { parent: true } : undefined,
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  private async getAncestorIds(page: Page, projectId: string) {
    const ancestorIds: string[] = [];
    let currentParentId = page.parentId;

    while (currentParentId) {
      const parent = await this.getPageOrFail(projectId, currentParentId, true);
      ancestorIds.unshift(parent.id);
      currentParentId = parent.parentId;
    }

    return ancestorIds;
  }

  private async assertValidParent(
    projectId: string,
    pageId: string,
    parentId: string,
  ) {
    if (pageId === parentId) {
      throw new BadRequestException('A page cannot be its own parent');
    }

    let currentParentId: string | null = parentId;
    while (currentParentId) {
      if (currentParentId === pageId) {
        throw new BadRequestException(
          'A page cannot be moved inside one of its descendants',
        );
      }

      const currentParent = await this.getPageOrFail(
        projectId,
        currentParentId,
        true,
      );
      currentParentId = currentParent.parentId;
    }
  }

  async createPage(orgId: string, projectId: string, data: CreatePageDto) {
    const page = new Page();
    const project = await this.getProjectOrFail(orgId, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    page.project = project;
    page.slug = this.toSlug(page.title);
    if (data.parentId) {
      page.parent = await this.getPageOrFail(projectId, data.parentId);
    }
    await this.pageRepository.save(page);
    const pageDto = this.toPageDto(page);

    this.eventEmitter.emit('page.created', pageDto);

    return pageDto;
  }

  async getPagesByParent(
    orgId: string,
    projectId: string,
    parentId?: string,
    searchTerm?: string,
  ) {
    const project = await this.getProjectOrFail(orgId, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const query = this.pageRepository
      .createQueryBuilder('page')
      .where('page.projectId = :projectId', { projectId: project.id })
      .loadRelationCountAndMap('page.childCount', 'page.children')
      .orderBy('page.createdAt', 'ASC');

    if (!searchTerm) {
      if (parentId) {
        query.andWhere('page.parentId = :parentId', { parentId });
      } else {
        query.andWhere('page.parentId IS NULL');
      }
    }

    if (searchTerm) {
      query.andWhere('page.title ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });
    }

    const res = await query.getMany();
    return res.map((page) => this.toPageDto(page));
  }

  async getPage(orgId: string, projectId: string, id: string) {
    const project = await this.getProjectOrFail(orgId, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const page = await this.pageRepository
      .createQueryBuilder('page')
      .where('page.projectId = :projectId', { projectId: project.id })
      .andWhere('page.id = :id', { id })
      .leftJoinAndSelect('page.parent', 'parent')
      .loadRelationCountAndMap('page.childCount', 'page.children')
      .getOne();

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const ancestorIds = await this.getAncestorIds(page, project.id);

    return this.toPageDto(page, ancestorIds);
  }

  async updatePage(
    orgId: string,
    projectId: string,
    id: string,
    data: UpdatePageDto,
  ) {
    const project = await this.getProjectOrFail(orgId, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const page = await this.getPageOrFail(project.id, id, true);
    const previousPage = { ...page };
    if (data.title !== undefined) {
      page.title = this.normalizeTitle(data.title);
      page.slug = this.toSlug(page.title);
    }
    if (data.content !== undefined) {
      page.content = data.content;
    }
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        page.parent = null;
      } else {
        await this.assertValidParent(project.id, page.id, data.parentId);

        page.parent = await this.getPageOrFail(project.id, data.parentId);
      }
    }
    await this.pageRepository.save(page);
    this.eventEmitter.emit('page.updated', {
      previous: previousPage,
      current: page,
    });

    const ancestorIds = await this.getAncestorIds(page, project.id);
    return this.toPageDto(page, ancestorIds);
  }

  async deletePage(orgId: string, projectId: string, id: string) {
    const project = await this.getProjectOrFail(orgId, projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const page = await this.getPageOrFail(project.id, id);
    await this.pageRepository.remove(page);
    this.eventEmitter.emit('page.deleted', { id });
  }
}
