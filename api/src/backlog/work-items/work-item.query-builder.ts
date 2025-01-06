import { Repository } from 'typeorm';
import { WorkItem } from './work-item.entity';
import WorkItemMapper from './work-item.mapper';

export interface FilterOptions {
  status?: string[];
  assigneeIds?: string[];
  priority?: ('high' | 'medium' | 'low')[];
  completedAt?: {
    start?: Date;
    end?: Date;
  };
}

export interface SearchOptions {
  term?: string; // For title/description search
  reference?: string; // For reference search
}

export class WorkItemQueryBuilder {
  private baseQuery = `
    SELECT wi2.*
    FROM (SELECT DISTINCT wi.*,
                 CASE
                     WHEN wi."priority" = 'high' THEN 1
                     WHEN wi."priority" = 'medium' THEN 2
                     WHEN wi."priority" = 'low' THEN 3
                     ELSE 4
                 END as priority_order,
                 u.id as "assignedToId",
                 u.name as "assignedToName"
          FROM work_item wi
          LEFT JOIN "user" u ON u.id = wi."assignedToId"
          WHERE wi."orgId" = $1
            AND wi."projectId" = $2
  `;

  private paramCounter = 2;
  private whereConditions: string[] = [];
  private queryParams: any[] = [];

  constructor(
    private readonly orgId: string,
    private readonly projectId: string,
    private readonly search: SearchOptions,
    private readonly workItemsRepository: Repository<WorkItem>,
    private readonly filters?: FilterOptions,
  ) {
    this.queryParams = [orgId, projectId];
    this.buildSearchConditions();
    this.buildFilters();
  }

  private getNextParamNumber(): number {
    this.paramCounter++;
    return this.paramCounter;
  }

  private addFilter(condition: string, ...params: any[]): void {
    this.whereConditions.push(condition);
    this.queryParams.push(...params);
  }

  private buildSearchConditions(): void {
    if (this.search.term) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(
        `(wi.title ILIKE $${paramNum} OR wi.description ILIKE $${paramNum})`,
        `%${this.search.term}%`,
      );
    }

    if (this.search.reference) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(
        `LOWER(wi.reference) = LOWER($${paramNum})`,
        this.search.reference,
      );
    }
  }

  private buildFilters(): void {
    if (!this.filters) return;

    const { status, assigneeIds, priority, completedAt } = this.filters;

    if (status?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`wi.status = ANY($${paramNum})`, status);
    }

    if (assigneeIds?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`wi."assignedToId" = ANY($${paramNum})`, assigneeIds);
    }

    if (priority?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`wi.priority = ANY($${paramNum})`, priority);
    }

    if (completedAt?.start) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`wi."completedAt" >= $${paramNum}`, completedAt.start);
    }
    if (completedAt?.end) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`wi."completedAt" <= $${paramNum}`, completedAt.end);
    }
  }

  private buildOrderBy(): string {
    return `
      ORDER BY wi2.priority_order,
               wi2."createdAt" DESC
    `;
  }

  private buildQuery(
    includeLimit = false,
    page = 1,
    limit = 0,
  ): {
    query: string;
    params: any[];
  } {
    let query = this.baseQuery;

    if (this.whereConditions.length > 0) {
      query += ` AND ${this.whereConditions.join(' AND ')}`;
    }

    query += `) wi2`;
    query += this.buildOrderBy();

    if (includeLimit && limit > 0) {
      const offset = (page - 1) * limit;
      query += ` OFFSET $${this.getNextParamNumber()} LIMIT $${this.getNextParamNumber()}`;
      this.queryParams.push(offset, limit);
    }

    return {
      query,
      params: this.queryParams,
    };
  }

  async execute(page = 1, limit = 0) {
    const { query, params } = this.buildQuery(true, page, limit);
    const workItems = await this.workItemsRepository.query(query, params);
    return WorkItemMapper.toSimpleListDto(workItems);
  }

  async count(): Promise<number> {
    let countQuery = `
      SELECT COUNT(DISTINCT wi.id) as total 
      FROM work_item wi
      LEFT JOIN "user" u ON u.id = wi."assignedToId"
      WHERE wi."orgId" = $1
        AND wi."projectId" = $2
    `;

    if (this.whereConditions.length > 0) {
      countQuery += ` AND ${this.whereConditions.join(' AND ')}`;
    }

    const result = await this.workItemsRepository.query(
      countQuery,
      this.queryParams,
    );
    return parseInt(result[0].total);
  }
}
