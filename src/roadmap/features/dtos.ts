import { Priority } from "../../common/priority.enum";
import { Timeline } from "../../common/timeline.enum";

export interface CreateUpdateFeatureDto {
  title: string;
  priority: Priority;
  timeline: Timeline;
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
