import { IsNotEmpty, IsOptional } from 'class-validator';
import { RequestStatus } from './request-status.enum';
import { CommentDto } from '../comments/dtos';
import { InitiativeDto } from '../okrs/dtos';

export class CreateRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

export class UpdateRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  status: RequestStatus;

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

export interface RequestDto {
  id: string;
  title: string;
  description: string;
  createdBy: UserDto;
  org: OrgDto;
  status: RequestStatus;
  estimation: number;
  votesCount: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  comments: CommentDto[];
  initiatives: InitiativeDto[];
}
