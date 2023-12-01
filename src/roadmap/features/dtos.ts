import { Priority } from "../../common/priority.enum";

export interface CreateFeatureDto {
  title: string;
  priority: Priority;
  description?: string;
  milestone?: string;
  keyResult?: string;
}

export interface FeatureDto {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
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
