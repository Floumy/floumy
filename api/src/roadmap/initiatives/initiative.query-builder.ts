import { InitiativeMapper } from './initiative.mapper';
import { InitiativesListDto } from './dtos';
import { Repository } from 'typeorm';
import { Initiative } from './initiative.entity';

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

export class InitiativeQueryBuilder {
  private baseQuery = `
      SELECT f2.*
      FROM (SELECT DISTINCT f.*,
                            CASE
                                WHEN f."priority" = 'high' THEN 1
                                WHEN f."priority" = 'medium' THEN 2
                                WHEN f."priority" = 'low' THEN 3
                                ELSE 4
                                END as priority_order,
                            u.id    as "assignedToId",
                            u.name  as "assignedToName"
            FROM initiative f
                     LEFT JOIN "user" u ON u.id = f."assignedToId"
            WHERE f."orgId" = $1
              AND f."projectId" = $2
  `;

  private paramCounter = 2; // Start after orgId and projectId
  private whereConditions: string[] = [];
  private queryParams: any[] = [];

  constructor(
    private readonly orgId: string,
    private readonly projectId: string,
    private readonly search: SearchOptions,
    private readonly initiativeRepository: Repository<Initiative>,
    private readonly filters?: FilterOptions,
  ) {
    // Initialize base params
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
        `(f.title ILIKE $${paramNum} OR f.description ILIKE $${paramNum})`,
        `%${this.search.term}%`,
      );
    }

    if (this.search.reference) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(
        `LOWER(f.reference) LIKE LOWER($${paramNum})`,
        this.search.reference,
      );
    }
  }

  private buildFilters(): void {
    if (!this.filters) return;

    const { status, assigneeIds, priority, completedAt } = this.filters;

    // Status filter
    if (status?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`f.status = ANY($${paramNum})`, status);
    }

    // Assignees filter
    if (assigneeIds?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`f."assignedToId" = ANY($${paramNum})`, assigneeIds);
    }

    // Priority filter
    if (priority?.length) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`f.priority = ANY($${paramNum})`, priority);
    }

    // Completed at range filter
    if (completedAt?.start) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`f."completedAt" >= $${paramNum}`, completedAt.start);
    }
    if (completedAt?.end) {
      const paramNum = this.getNextParamNumber();
      this.addFilter(`f."completedAt" <= $${paramNum}`, completedAt.end);
    }
  }

  private buildOrderBy(): string {
    return `
      ORDER BY f2.priority_order,
      f2."createdAt" DESC
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

    // Add where conditions before closing the subquery
    if (this.whereConditions.length > 0) {
      query += ` AND ${this.whereConditions.join(' AND ')}`;
    }

    // Close the subquery
    query += `) f2`;

    // Add order by after the subquery
    query += this.buildOrderBy();

    // Add pagination if requested
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

  async execute(page = 1, limit = 0): Promise<InitiativesListDto[]> {
    const { query, params } = this.buildQuery(true, page, limit);
    const initiatives = await this.initiativeRepository.query(query, params);
    return InitiativeMapper.toSearchListDto(initiatives);
  }

  async count(): Promise<number> {
    let countQuery = `
      SELECT COUNT(DISTINCT f.id) as total 
      FROM initiative f
     LEFT JOIN "user" u ON u.id = f."assignedToId"
      WHERE f."orgId" = $1
        AND f."projectId" = $2
        AND (f.title ILIKE $3 OR f.description ILIKE $3)
    `;

    if (this.whereConditions.length > 0) {
      countQuery += ` AND ${this.whereConditions.join(' AND ')}`;
    }

    const result = await this.initiativeRepository.query(
      countQuery,
      this.queryParams,
    );
    return parseInt(result[0].total);
  }
}
