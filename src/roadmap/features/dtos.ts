import { Timeline } from "src/common/timeline.enum";
import { Priority } from "../../common/priority.enum";

export interface CreateFeatureDto {
  title: string;
  description?: string;
  timeline: Timeline;
  priority: Priority;
  keyResult?: string;
}

export interface FeatureDto {
  id: string;
  title: string;
  description?: string;
  timeline: Timeline;
  priority: Priority;
  keyResult?: {
    id: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeaturesListDto {
  id: string;
  title: string;
  timeline: Timeline;
  priority: Priority;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
