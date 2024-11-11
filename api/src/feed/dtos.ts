import { Org } from '../orgs/org.entity';

export interface FeedItemDto {
  id: string;
  title: string;
  entity: string;
  entityId: string;
  action: string;
  content: any;
  org: Promise<Org>;
  createdAt: Date;
}
