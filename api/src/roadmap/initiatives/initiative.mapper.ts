import { Initiative } from './initiative.entity';
import { InitiativeDto, InitiativesListDto, SearchInitiative } from './dtos';
import { CommentMapper } from '../../comments/mappers';

class BreadcrumbMapper {
  static async toDto(
    initiative: Initiative,
  ): Promise<{ reference: string; type: string; id: string }[]> {
    const keyResult = await initiative.keyResult;
    let objective = null;

    const breadcrumbs = [
      {
        reference: initiative.reference,
        type: 'initiative',
        id: initiative.id,
      },
    ];

    if (keyResult) {
      breadcrumbs.push({
        reference: keyResult.reference,
        type: 'key-result',
        id: keyResult.id,
      });
      objective = await keyResult.objective;
    }

    if (objective) {
      breadcrumbs.push({
        reference: objective.reference,
        type: 'objective',
        id: objective.id,
      });
    }

    return breadcrumbs.reverse();
  }
}

export class InitiativeMapper {
  static async toDto(initiative: Initiative): Promise<InitiativeDto> {
    const createdBy = await initiative.createdBy;
    const assignedTo = await initiative.assignedTo;
    const org = await initiative.org;
    const comments = await initiative.comments;
    const featureRequest = await initiative.featureRequest;
    const project = await initiative.project;

    const initiativeDto = {
      id: initiative.id,
      org: {
        id: org.id,
        name: org.name,
      },
      project: {
        id: project.id,
      },
      reference: initiative.reference,
      title: initiative.title,
      description: initiative.description,
      priority: initiative.priority,
      status: initiative.status,
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      workItems: (await initiative.workItems).map(WorkItemMapper.toDto),
      comments: await CommentMapper.toDtoList(comments),
      featureRequest: featureRequest
        ? {
            id: featureRequest.id,
            title: featureRequest.title,
          }
        : null,
      files: await Promise.all(
        (await initiative.initiativeFiles).map(async (initiativeFile) => {
          const file = await initiativeFile.file;
          return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
          };
        }),
      ),
      createdBy: createdBy
        ? {
            id: createdBy.id,
            name: createdBy.name,
          }
        : undefined,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : undefined,
      breadcrumbs: await BreadcrumbMapper.toDto(initiative),
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
      completedAt: initiative.completedAt,
    };
    const initiativeKeyResult = await initiative.keyResult;
    if (initiativeKeyResult) {
      initiativeDto['keyResult'] = {
        id: initiativeKeyResult.id,
        title: initiativeKeyResult.title,
      };
    }
    const initiativeMilestone = await initiative.milestone;
    if (initiativeMilestone) {
      initiativeDto['milestone'] = {
        id: initiativeMilestone.id,
        title: initiativeMilestone.title,
        dueDate: initiativeMilestone.dueDate,
      };
    }
    return initiativeDto;
  }

  static async toListDtoWithoutAssignees(
    initiatives: Initiative[],
  ): Promise<InitiativesListDto[]> {
    return await Promise.all(
      initiatives.map(InitiativeMapper.toListItemDtoWithoutAssignees),
    );
  }

  static async toSearchListDto(
    initiatives: SearchInitiative[],
  ): Promise<InitiativesListDto[]> {
    return await Promise.all(
      initiatives.map(InitiativeMapper.toSearchListItemDto),
    );
  }

  static async toSearchListItemDto(
    initiative: SearchInitiative,
  ): Promise<InitiativesListDto> {
    return {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      priority: initiative.priority,
      status: initiative.status,
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      assignedTo: initiative.assignedToId
        ? {
            id: initiative.assignedToId,
            name: initiative.assignedToName,
          }
        : null,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
    };
  }

  static async toListDto(
    initiatives: Initiative[],
  ): Promise<InitiativesListDto[]> {
    return await Promise.all(initiatives.map(InitiativeMapper.toListItemDto));
  }

  static async toListItemDto(
    initiative: Initiative,
  ): Promise<InitiativesListDto> {
    const assignedTo = await initiative.assignedTo;
    return {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      priority: initiative.priority,
      status: initiative.status,
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
          }
        : null,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
    };
  }

  static async toListItemDtoWithoutAssignees(
    initiative: Initiative,
  ): Promise<InitiativesListDto> {
    return {
      id: initiative.id,
      reference: initiative.reference,
      title: initiative.title,
      priority: initiative.priority,
      status: initiative.status,
      progress: initiative.progress,
      workItemsCount: initiative.workItemsCount,
      createdAt: initiative.createdAt,
      updatedAt: initiative.updatedAt,
    };
  }
}

class WorkItemMapper {
  static toDto(workItem: any): any {
    return {
      id: workItem.id,
      reference: workItem.reference,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      status: workItem.status,
      type: workItem.type,
      estimation: workItem.estimation,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
