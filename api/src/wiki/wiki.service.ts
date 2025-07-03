import { Injectable } from '@nestjs/common';
import { WikiPage } from './wiki-page.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, ILike } from 'typeorm';
import { Project } from '../projects/project.entity';
import { CreateWikiPageDto, UpdateWikiPageDto } from './wiki-page.dtos';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiPage)
    private wikiPageRepository: Repository<WikiPage>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async createPage(projectId, data: CreateWikiPageDto) {
    const page = new WikiPage();
    page.project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    if (data.parentId) {
      const parentPage = await this.wikiPageRepository.findOneBy({
        id: data.parentId,
        project: { id: projectId },
      });
      if (!parentPage) {
        throw new Error('Parent page not found');
      }
      page.parent = parentPage;
    }
    await this.wikiPageRepository.save(page);
    return {
      id: page.id,
      title: page.title,
      content: page.content,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      parentId: page.parent ? page.parent.id : null,
    };
  }

  async getPagesByParent(
    projectId: string,
    parentId?: string,
    searchTerm?: string,
  ) {
    const project = await this.projectRepository.findOneByOrFail({
      id: projectId,
    });
    const res = await this.wikiPageRepository.find({
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

  async updatePage(id: string, data: UpdateWikiPageDto) {
    const page = await this.wikiPageRepository.findOneByOrFail({ id });
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
        const parentPage = await this.wikiPageRepository.findOneBy({
          id: data.parentId,
        });
        if (!parentPage) {
          throw new Error('Parent page not found');
        }
        page.parent = parentPage;
      }
    }
    await this.wikiPageRepository.save(page);
  }

  async deletePage(id: string) {
    const page = await this.wikiPageRepository.findOneByOrFail({ id });
    await this.wikiPageRepository.remove(page);
  }
}
