import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsService {
  async listProjects(orgId: string) {
    return Promise.resolve(undefined);
  }
}
