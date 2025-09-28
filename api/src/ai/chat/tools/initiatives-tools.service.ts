import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { InjectRepository } from '@nestjs/typeorm';
import { Org } from '../../../orgs/org.entity';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.entity';
import { User } from '../../../users/user.entity';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Priority } from '../../../common/priority.enum';
import { Initiative } from '../../../roadmap/initiatives/initiative.entity';
import { InitiativesService } from '../../../roadmap/initiatives/initiatives.service';
import { InitiativeStatus } from '../../../roadmap/initiatives/initiativestatus.enum';
import { KeyResult } from '../../../okrs/key-result.entity';

@Injectable()
export class InitiativesToolsService {
  constructor(
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(KeyResult)
    private keyResultsRepository: Repository<KeyResult>,
    private initiativesService: InitiativesService,
  ) {}

  getTools(orgId: string, projectId?: string, userId?: string) {
    const tools: DynamicStructuredTool[] = [
      this.findOneInitiative(orgId, projectId),
      this.listInitiativeWorkItems(orgId),
    ];
    if (projectId && userId) {
      tools.push(this.confirmAndCreateInitiative(orgId, projectId, userId));
      tools.push(this.confirmAndUpdateInitiative(orgId, projectId, userId));
    }
    return tools;
  }

  private findOneInitiative(orgId: string, projectId?: string) {
    return tool(
      async ({ initiativeReference }) => {
        if (!initiativeReference) {
          return 'Please provide an initiative reference';
        }

        const findOptions = {
          reference: initiativeReference,
          org: {
            id: orgId,
          },
          project: undefined,
        };

        if (projectId) {
          findOptions.project = {
            id: projectId,
          };
        }

        try {
          const initiative =
            await this.initiativeRepository.findOneByOrFail(findOptions);

          return `
              Title: ${initiative.title}
              Description: ${initiative.description}
              Priority: ${initiative.priority}
              Status: ${initiative.status}
              Reference: ${initiative.reference}
              `;
        } catch (e) {
          return 'Failed to find the initiative';
        }
      },
      {
        name: 'find-one-initiative',
        description: 'Find a initiative in the system based on its reference.',
        schema: z.object({
          initiativeReference: z
            .string()
            .describe(
              'The initiative reference to search for in the form of I-123',
            ),
        }),
      },
    );
  }

  private listInitiativeWorkItems(orgId: string) {
    return tool(
      async ({ initiativeReference }) => {
        if (!initiativeReference) {
          return 'Please provide an initiative reference';
        }

        const findOptions = {
          reference: initiativeReference,
          org: {
            id: orgId,
          },
        };

        try {
          const initiative =
            await this.initiativeRepository.findOneByOrFail(findOptions);

          const workItems = await initiative.workItems;

          let output = '';
          for (const workItem of workItems) {
            output += `${workItem.reference}: ${workItem.title}\n`;
          }

          return output;
        } catch (e) {
          return 'Failed to find the initiative';
        }
      },
      {
        name: 'list-initiative-work-item',
        description: 'List the work items within a given initiative.',
        schema: z.object({
          initiativeReference: z
            .string()
            .describe(
              'The initiative reference to search for in the form of I-123',
            ),
        }),
      },
    );
  }

  private confirmAndCreateInitiative(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({
        initiativeTitle,
        initiativeDescription,
        keyResultReference,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });

          const createInitiativeDto = {
            title: initiativeTitle,
            description: initiativeDescription,
            status: InitiativeStatus.PLANNED,
            priority: Priority.MEDIUM,
            keyResult: undefined,
          };

          if (keyResultReference) {
            const keyResult = await this.keyResultsRepository.findOneByOrFail({
              reference: keyResultReference,
              org: {
                id: orgId,
              },
              project: {
                id: projectId,
              },
            });

            createInitiativeDto.keyResult = keyResult.id;
          }

          const savedInitiative =
            await this.initiativesService.createInitiative(
              org.id,
              project.id,
              user.id,
              createInitiativeDto,
            );

          return `Successfully created initiative with reference ${savedInitiative.reference}\nInitiative Details\n- title: ${savedInitiative.title}\n- description: ${savedInitiative.description}\n- status: ${savedInitiative.status}\n- priority: ${savedInitiative.priority}`;
        } catch (e) {
          return 'Failed to create initiative because ' + (e as any).message;
        }
      },
      {
        name: 'confirm-initiative',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create the initiative.',
        schema: z.object({
          initiativeTitle: z.string().describe('The initiative title.'),
          initiativeDescription: z
            .string()
            .describe('The initiative description.'),
          keyResultReference: z
            .string()
            .optional()
            .describe(
              'The key result reference with the format KR-123 to associate the initiative to',
            ),
        }),
      },
    );
  }
  private confirmAndUpdateInitiative(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({
        initiativeReference,
        initiativeTitle,
        initiativeDescription,
        initiativePriority,
        initiativeStatus,
        keyResultReference,
      }) => {
        try {
          const org = await this.orgRepository.findOneByOrFail({ id: orgId });
          const project = await this.projectRepository.findOneByOrFail({
            id: projectId,
            org: { id: orgId },
          });
          const user = await this.userRepository.findOneByOrFail({
            id: userId,
          });

          const initiative = await this.initiativeRepository.findOneByOrFail({
            reference: initiativeReference,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          });

          const updateInitiativeDto = {
            title: initiativeTitle,
            description: initiativeDescription,
            priority: initiativePriority as Priority,
            status: initiativeStatus as InitiativeStatus,
            keyResult: undefined,
          };

          if (keyResultReference) {
            const keyResult = await this.keyResultsRepository.findOneByOrFail({
              reference: keyResultReference,
              org: {
                id: orgId,
              },
              project: {
                id: projectId,
              },
            });

            updateInitiativeDto.keyResult = keyResult.id;
          }

          const updatedInitiative =
            await this.initiativesService.updateInitiative(
              user.id,
              org.id,
              project.id,
              initiative.id,
              updateInitiativeDto,
            );

          return `Successfully updated initiative ${updatedInitiative.reference}\n
                  Initiative Details\n
                  - title: ${updatedInitiative.title}\n
                  - description: ${updatedInitiative.description}\n
                  - status: ${updatedInitiative.status}\n
                  - priority: ${updatedInitiative.priority}`;
        } catch (e) {
          return 'Failed to update initiative';
        }
      },
      {
        name: 'confirm-update-initiative',
        description:
          'After the user explicitly approves an initiative update in natural language, call this tool to update the initiative.',
        schema: z.object({
          initiativeReference: z
            .string()
            .describe(
              'The initiative reference to update in the form of I-123',
            ),
          initiativeTitle: z.string().describe('The initiative title.'),
          initiativeDescription: z
            .string()
            .describe('The initiative description.'),
          initiativePriority: z
            .enum(['low', 'medium', 'high'])
            .describe('One of the options low, medium, high'),
          initiativeStatus: z
            .enum([
              'planned',
              'ready-to-start',
              'in-progress',
              'completed',
              'closed',
            ])
            .describe('The new status for the initiative'),
          keyResultReference: z
            .string()
            .optional()
            .describe(
              'The key result reference with the format KR-123 to associate the initiative to',
            ),
        }),
      },
    );
  }
}
