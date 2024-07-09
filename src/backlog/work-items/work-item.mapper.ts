import { WorkItem } from './work-item.entity';
import { WorkItemDto } from './dtos';
import { Feature } from '../../roadmap/features/feature.entity';
import { Iteration } from '../../iterations/Iteration.entity';
import { User } from '../../users/user.entity';

class FeatureMapper {
  static toDto(feature: Feature) {
    return {
      id: feature.id,
      title: feature.title,
    };
  }
}

class IterationMapper {
  static toDto(iteration: Iteration) {
    return {
      id: iteration.id,
      title: iteration.title,
    };
  }
}

class UserMapper {
  static toDto(user: User) {
    return {
      id: user.id,
      name: user.name,
    };
  }
}

export default class WorkItemMapper {
  static async toDto(workItem: WorkItem): Promise<WorkItemDto> {
    const feature = await workItem.feature;
    const iteration = await workItem.iteration;
    const createdBy = await workItem.createdBy;
    const assignedTo = await workItem.assignedTo;
    const org = await workItem.org;
    return {
      id: workItem.id,
      org: org ? { id: org.id } : undefined,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      iteration: iteration ? IterationMapper.toDto(iteration) : undefined,
      files: await Promise.all(
        (await workItem.workItemFiles).map(async (workItemFile) => {
          const file = await workItemFile.file;
          return {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
          };
        }),
      ),
      createdBy: createdBy ? UserMapper.toDto(createdBy) : undefined,
      assignedTo: assignedTo ? UserMapper.toDto(assignedTo) : undefined,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static async toListItemDto(workItem: WorkItem) {
    const feature = await workItem.feature;
    const assignedTo = await workItem.assignedTo;
    return {
      id: workItem.id,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      feature: feature ? FeatureMapper.toDto(feature) : undefined,
      assignedTo: assignedTo ? UserMapper.toDto(assignedTo) : undefined,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }

  static async toListDto(workItems: WorkItem[]) {
    return await Promise.all(workItems.map(this.toListItemDto));
  }

  static toSimpleListDto(workItems: WorkItem[]) {
    return workItems.map(this.toSimpleListItemDto);
  }

  static toSimpleListItemDto(workItem: WorkItem) {
    return {
      id: workItem.id,
      reference: `WI-${workItem.sequenceNumber}`,
      title: workItem.title,
      description: workItem.description,
      priority: workItem.priority,
      type: workItem.type,
      status: workItem.status,
      estimation: workItem.estimation,
      completedAt: workItem.completedAt,
      createdAt: workItem.createdAt,
      updatedAt: workItem.updatedAt,
    };
  }
}
