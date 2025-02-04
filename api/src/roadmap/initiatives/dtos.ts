import { Priority } from '../../common/priority.enum';
import { InitiativeStatus } from './initiativestatus.enum';

export interface CreateUpdateInitiativeDto {
  featureRequest?: string;
  title: string;
  priority: Priority;
  status: InitiativeStatus;
  description?: string;
  mentions?: string[];
  milestone?: string;
  keyResult?: string;
  files?: { id: string }[];
  assignedTo?: string;
}

export interface PatchInitiativeDto {
  priority?: Priority;
  status?: InitiativeStatus;
  milestone?: string;
  keyResult?: string;
  featureRequest?: string;
}

export interface InitiativeDto {
  id: string;
  org: {
    id: string;
    name: string;
  };
  project: {
    id: string;
  };
  reference: string;
  title: string;
  description?: string;
  priority: Priority;
  status: InitiativeStatus;
  progress: number;
  workItemsCount: number;
  keyResult?: {
    id: string;
    title: string;
  };
  milestone?: {
    id: string;
    title: string;
  };
  featureRequest?: {
    id: string;
    title: string;
  };
  files?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  createdBy?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface InitiativesListDto {
  id: string;
  reference: string;
  title: string;
  priority: Priority;
  status: string;
  progress: number;
  workItemsCount: number;
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchInitiative {
  id: string;
  reference: string;
  title: string;
  priority: Priority;
  status: string;
  progress: number;
  workItemsCount: number;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}
