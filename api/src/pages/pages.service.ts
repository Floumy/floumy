import { Injectable } from '@nestjs/common';
import { Page } from './pages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
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

  async createPage(projectId: string, data: CreatePageDto) {
    const page = new Page();
    page.project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    if (data.parentId) {
      const parentPage = await this.pageRepository.findOneBy({
        id: data.parentId,
        project: { id: projectId },
      });
      if (!parentPage) {
        throw new Error('Parent page not found');
      }
      page.parent = parentPage;
    }
    await this.pageRepository.save(page);
    const pageDto = {
      id: page.id,
      title: page.title,
      content: page.content,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      parentId: page.parent ? page.parent.id : null,
    };

    this.eventEmitter.emit('page.created', pageDto);

    return pageDto;
  }

  async getPagesByParent(
    projectId: string,
    parentId?: string,
    searchTerm?: string,
  ) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    const res = await this.pageRepository.find({
      where: {
        project: {
          id: project.id,
        },
        parent: !searchTerm
          ? parentId
            ? { id: parentId }
            : IsNull()
          : undefined,
        title: searchTerm ? ILike(`%${searchTerm}%`) : undefined,
      },
      order: {
        createdAt: 'ASC',
      },
    });
    return res.map((page) => {
      return {
        id: page.id,
        title: page.title,
        content: page.content,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        parentId: page.parentId,
      };
    });
  }

  async updatePage(id: string, data: UpdatePageDto) {
    const page = await this.pageRepository.findOneByOrFail({ id });
    const previousPage = { ...page };
    if (data.title) {
      page.title = data.title;
    }
    if (data.content) {
      page.content = data.content;
    }
    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        page.parent = null;
      } else {
        const parentPage = await this.pageRepository.findOneBy({
          id: data.parentId,
        });
        if (!parentPage) {
          throw new Error('Parent page not found');
        }
        page.parent = parentPage;
      }
    }
    await this.pageRepository.save(page);
    this.eventEmitter.emit('page.updated', {
      previous: previousPage,
      current: page,
    });
  }

  async deletePage(id: string) {
    const page = await this.pageRepository.findOneByOrFail({ id });
    await this.pageRepository.remove(page);
    this.eventEmitter.emit('page.deleted', { id });
  }
}
