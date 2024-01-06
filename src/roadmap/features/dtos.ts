import { Priority } from "../../common/priority.enum";
import { FeatureStatus } from "./featurestatus.enum";

export interface CreateUpdateFeatureDto {
  title: string;
  priority: Priority;
  status: FeatureStatus;
  description?: string;
  milestone?: string;
  keyResult?: string;
}

export interface FeatureDto {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  timeline: string;
  status: FeatureStatus;
  keyResult?: {
    id: string;
    title: string;
  };
  milestone?: {
    id: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeaturesListDto {
  id: string;
  title: string;
  priority: Priority;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
