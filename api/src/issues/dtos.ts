import { IssueStatus } from './issue-status.enum';
import { IsNotEmpty } from 'class-validator';
import { Priority } from '../common/priority.enum';

export class IssueDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
}

export class UpdateIssueDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  status: IssueStatus;
  @IsNotEmpty()
  priority: Priority;
}
