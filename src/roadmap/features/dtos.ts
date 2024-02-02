import { Priority } from "../../common/priority.enum";
import { FeatureStatus } from "./featurestatus.enum";

export interface CreateUpdateFeatureDto {
  title: string;
  priority: Priority;
  status: FeatureStatus;
  description?: string;
  milestone?: string;
  keyResult?: string;
  files?: { id: string }[];
}

export interface PatchFeatureDto {
  priority?: Priority;
  status?: FeatureStatus;
  milestone?: string;
}

export interface FeatureDto {
  id: string;
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
  files?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeaturesListDto {
  id: string;
  title: string;
  priority: Priority;
  status: string;
  progress: number;
  workItemsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
