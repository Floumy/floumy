import { Injectable, Inject } from '@nestjs/common';
import { OrgOkrsService } from '../../okrs/org-okrs.service';
import { McpService } from '../services/mcp.service';
import { z } from 'zod';
import { entityNotFound } from '../utils';
import { Objective } from '../../okrs/objective.entity';
import { Repository } from 'typeorm';
import { Tool } from '@rekog/mcp-nest';
import { InjectRepository } from '@nestjs/typeorm';
import { OkrsService } from '../../okrs/okrs.service';
import { TimelineService } from '../../common/timeline.service';
import { KeyResult } from '../../okrs/key-result.entity';

@Injectable()
export class OkrTool {
  constructor(
    private readonly orgOkrsService: OrgOkrsService,
    private readonly okrService: OkrsService,
    private readonly mcpService: McpService,
    @InjectRepository(Objective)
    private readonly objectiveRepository: Repository<Objective>,
    @Inject('REQUEST') private readonly request: any,
  ) {}

  @Tool({
    name: 'get-org-objectives',
    description: 'Get objectives for the organization.',
  })
  async getOrgObjectives() {
    const user = await this.mcpService.getUserFromRequest(this.request);
    const org = await user.org;
    const objectives = await this.orgOkrsService.list(org.id);
    if (!objectives || objectives.length === 0) {
      return entityNotFound('objective');
    }
    return {
      content: objectives.map((obj) => ({
        type: 'text',
        text: `Reference: ${obj.reference}
        Title: ${obj.title}
        Assigned To: ${obj.assignedTo ? obj.assignedTo.name : 'Unassigned'}
        Timeline: ${obj.timeline}`,
      })),
    };
  }

  @Tool({
    name: 'get-project-objectives',
    description: 'Get objectives for a specific project by project ID.',
    parameters: z.object({
      projectId: z.string().describe('The ID of the project.'),
    }),
  })
  async getProjectObjectives({ projectId }: { projectId: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    const org = await user.org;
    const objectives = await this.okrService.list(org.id, projectId);
    if (!objectives || objectives.length === 0) {
      return entityNotFound('objective');
    }
    return {
      content: objectives.map((obj) => ({
        type: 'text',
        text: `Reference: ${obj.reference}
        Title: ${obj.title}
        Assigned To: ${obj.assignedTo ? obj.assignedTo.name : 'Unassigned'}
        Timeline: ${obj.timeline}`,
      })),
    };
  }

  @Tool({
    name: 'get-objective-with-key-results',
    description: 'Get one objective and its key results by reference.',
    parameters: z.object({
      reference: z.string().describe('The reference of the objective.'),
    }),
  })
  async getObjectiveWithKeyResults({ reference }: { reference: string }) {
    const user = await this.mcpService.getUserFromRequest(this.request);
    const org = await user.org;
    const objective = await this.objectiveRepository.findOne({
      where: { reference, org: { id: org.id } },
    });
    if (!objective) {
      return entityNotFound('objective');
    }
    // Get key results
    const details = await this.orgOkrsService.getObjectiveDetails(
      objective.id,
      org.id,
    );
    const keyResults = details.keyResults || [];
    const timeline = TimelineService.startAndEndDatesToTimeline(
      objective.startDate,
      objective.endDate,
    );
    return {
      content: [
        {
          type: 'text',
          text: `Reference: ${objective.reference}
          Title: ${objective.title}
          Timeline: ${timeline}
          Objective ID: ${objective.id}
          Key Results:
            ${keyResults.map((kr: KeyResult) => `- ${kr.title} (KR ID: ${kr.id})`).join('\n')}`,
        },
      ],
    };
  }
}
