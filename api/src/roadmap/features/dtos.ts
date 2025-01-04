import { Priority } from '../../common/priority.enum';
import { FeatureStatus } from './featurestatus.enum';

export interface CreateUpdateFeatureDto {
  featureRequest?: string;
  title: string;
  priority: Priority;
  status: FeatureStatus;
  description?: string;
  mentions?: string[];
  milestone?: string;
  keyResult?: string;
  files?: { id: string }[];
  assignedTo?: string;
}

export interface PatchFeatureDto {
  priority?: Priority;
  status?: FeatureStatus;
  milestone?: string;
  keyResult?: string;
  featureRequest?: string;
}

export interface FeatureDto {
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
  status: FeatureStatus;
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

export interface FeaturesListDto {
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
