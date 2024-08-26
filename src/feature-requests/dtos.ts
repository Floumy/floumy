import { IsNotEmpty } from 'class-validator';
import { FeatureRequestStatus } from './feature-request-status.enum';

export class CreateFeatureRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
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
  completedAt: Date;
}
