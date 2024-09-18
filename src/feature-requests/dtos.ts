import { IsNotEmpty, IsOptional } from 'class-validator';
import { FeatureRequestStatus } from './feature-request-status.enum';
import { CommentDto } from '../comments/dtos';
import { FeatureDto } from '../okrs/dtos';

export class CreateFeatureRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

export class UpdateFeatureRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  status: FeatureRequestStatus;

  @IsOptional()
  estimation: number;
}

export interface UserDto {
  id: string;
  email: string;
}

export interface OrgDto {
  id: string;
  name: string;
}

export interface FeatureRequestDto {
  id: string;
  title: string;
  description: string;
  createdBy: UserDto;
  org: OrgDto;
  status: FeatureRequestStatus;
  estimation: number;
  votesCount: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: CommentDto[];
  features: FeatureDto[];
}
