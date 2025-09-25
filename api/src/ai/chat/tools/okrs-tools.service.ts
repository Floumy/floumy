import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { z } from 'zod';
import { KeyResult } from '../../../okrs/key-result.entity';
import { OkrsService } from '../../../okrs/okrs.service';
import { Timeline } from '../../../common/timeline.enum';
import { Objective } from '../../../okrs/objective.entity';

@Injectable()
export class OkrsToolsService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    private okrsService: OkrsService,
  ) {}

  getTools(orgId: string, projectId: string, userId?: string) {
    const tools: DynamicStructuredTool[] = [
      this.findOneOkr(orgId, projectId),
      this.findOneKeyResult(orgId, projectId),
      this.listOkrs(orgId, projectId),
      this.getOkrStats(orgId, projectId),
      this.confirmAndUpdateKeyResult(orgId, projectId),
    ];

    if (userId) {
      tools.push(this.confirmAndCreateOkr(orgId, projectId, userId));
      tools.push(this.confirmAndUpdateOkr(orgId, projectId, userId));
    }

    return tools;
  }

  private findOneOkr(orgId: string, projectId: string) {
    return tool(
      async ({ objectiveReference }) => {
        if (!objectiveReference) {
          return 'Please provide an objective ID';
        }

        try {
          const objective = await this.objectiveRepository.findOneByOrFail({
            reference: objectiveReference,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          });

          let output = `
            OKR Details:
            ID: ${objective.id}
            Reference: ${objective.reference}
            Title: ${objective.title}
            Status: ${objective.status}
            Progress: ${Math.round(objective.progress * 100)}%
            Timeline: ${objective.startDate ? new Date(objective.startDate).toLocaleDateString() + ' to ' + new Date(objective.endDate).toLocaleDateString() : 'Not scheduled'}
            
            Key Results:
            `;

          const keyResults = await objective.keyResults;

          if (!keyResults || keyResults.length === 0) {
            output += 'No key results defined for this objective.\n';
          } else {
            for (const kr of keyResults) {
              output += `- ID: ${kr.id}\n  Reference: ${kr.reference} Title: ${kr.title}\n  Progress: ${Math.round(kr.progress * 100)}%\n  Status: ${kr.status}\n\n`;

              const initiatives = await kr.initiatives;
              if (initiatives && initiatives.length > 0) {
                output += '  Related Initiatives:\n';
                for (const initiative of initiatives) {
                  output += `  - ${initiative.reference}: ${initiative.title}\n`;
                }
                output += '\n';
              }
            }
          }

          return output;
        } catch (e) {
          return 'Failed to find the OKR: ' + (e as any).message;
        }
      },
      {
        name: 'find-one-okr',
        description:
          'Find an OKR (objective and its key results) in the system based on the objective reference of the format O-123.',
        schema: z.object({
          objectiveReference: z
            .string()
            .describe(
              'The objective reference to search for in the format O-123',
            ),
        }),
      },
    );
  }

  private findOneKeyResult(orgId: string, projectId: string) {
    return tool(
      async ({ keyResultReference }) => {
        try {
          const keyResult = await this.keyResultRepository.findOneByOrFail({
            reference: keyResultReference,
            org: {
              id: orgId,
            },
            project: {
              id: projectId,
            },
          });

          let output = `
            Key Result Details:
            ID: ${keyResult.id}
            Reference: ${keyResult.reference}
            Title: ${keyResult.title}
            Status: ${keyResult.status}
            Progress: ${Math.round(keyResult.progress * 100)}%
     
            
            Key Results:
            `;

          const initiatives = await keyResult.initiatives;
          if (initiatives && initiatives.length > 0) {
            output += '  Related Initiatives:\n';
            for (const initiative of initiatives) {
              output += `  - ${initiative.reference}: ${initiative.title}\n`;
            }
            output += '\n';
          }

          return output;
        } catch (e) {
          return 'Failed to find the Key Result: ' + (e as any).message;
        }
      },
      {
        name: 'find-one-key-result',
        description:
          'Find an key result in the system based on the reference of the format KR-123.',
        schema: z.object({
          keyResultReference: z
            .string()
            .describe(
              'The key result reference to search for in the format KR-123',
            ),
        }),
      },
    );
  }

  private listOkrs(orgId: string, projectId?: string) {
    return tool(
      async ({ timeline }) => {
        if (!projectId) {
          return 'Project ID is required to list OKRs';
        }

        try {
          const timelineValue = (timeline as Timeline) || Timeline.THIS_QUARTER;
          const okrs = await this.okrsService.listForTimeline(
            orgId,
            projectId,
            timelineValue,
          );

          if (okrs.length === 0) {
            return `No OKRs found for ${timeline} timeline`;
          }

          let output = `OKRs for ${timeline} timeline:\n\n`;

          for (const okr of okrs) {
            output += `ID: ${okr.id}\nTitle: ${okr.title}\nProgress: ${Math.round(okr.progress * 100)}%\nStatus: ${okr.status}\n\n`;

            if (okr.keyResults && okr.keyResults.length > 0) {
              output += 'Key Results:\n';
              for (const kr of okr.keyResults) {
                output += `- ${kr.title} (${Math.round(kr.progress * 100)}% complete)\n`;
              }
              output += '\n';
            } else {
              output += 'No key results defined for this objective.\n\n';
            }
          }

          return output;
        } catch (e) {
          return 'Failed to list OKRs: ' + (e as any).message;
        }
      },
      {
        name: 'list-okrs',
        description: 'List OKRs for a given timeline.',
        schema: z.object({
          timeline: z
            .enum(['this-quarter', 'next-quarter', 'past', 'later'])
            .describe(
              'The timeline to list OKRs for: this-quarter, next-quarter, past, or later',
            )
            .optional(),
        }),
      },
    );
  }

  private getOkrStats(orgId: string, projectId?: string) {
    return tool(
      async ({ timeline }) => {
        if (!projectId) {
          return 'Project ID is required to get OKR statistics';
        }

        try {
          const timelineValue = (timeline as Timeline) || Timeline.THIS_QUARTER;
          const stats = await this.okrsService.getStats(
            orgId,
            projectId,
            timelineValue,
          );

          return `
          OKR Statistics for ${timeline || 'current'} timeline:
          
          Objectives:
          - Total: ${stats.objectives.total}
          - Completed: ${stats.objectives.completed}
          - In Progress: ${stats.objectives.inProgress}
          
          Key Results:
          - Total: ${stats.keyResults.total}
          - Completed: ${stats.keyResults.completed}
          - In Progress: ${stats.keyResults.inProgress}
          
          Current Progress: ${stats.progress.current}%
          `;
        } catch (e) {
          return 'Failed to get OKR statistics: ' + (e as any).message;
        }
      },
      {
        name: 'get-okr-stats',
        description: 'Get statistics for OKRs in a given timeline.',
        schema: z.object({
          timeline: z
            .enum(['this-quarter', 'next-quarter', 'past', 'later'])
            .describe(
              'The timeline to get stats for: this-quarter, next-quarter, past, or later',
            )
            .optional(),
        }),
      },
    );
  }

  private confirmAndCreateOkr(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({ objectiveTitle, objectiveTimeline, keyResults }) => {
        try {
          const keyResultsArray = keyResults || [];

          const okrDto = {
            objective: {
              title: objectiveTitle,
              timeline: objectiveTimeline || 'current',
              assignedTo: userId,
            },
            keyResults: keyResultsArray.map((title) => ({ title })),
          };

          const savedOkr = await this.okrsService.create(
            orgId,
            projectId,
            okrDto,
          );

          let output = `
          Successfully created OKR!
          
          Objective Details:
          - ID: ${savedOkr.objective.id}
          - Title: ${savedOkr.objective.title}
          - Timeline: ${okrDto.objective.timeline}
          - Status: ${savedOkr.objective.status}
          `;

          if (savedOkr.keyResults && savedOkr.keyResults.length > 0) {
            output += '\nKey Results:\n';
            for (const kr of savedOkr.keyResults) {
              output += `- ID: ${kr.id}\n  Title: ${kr.title}\n  Status: ${kr.status}\n`;
            }
          } else {
            output += '\nNo key results were created with this objective.';
          }

          return output;
        } catch (e) {
          return 'Failed to create OKR: ' + (e as any).message;
        }
      },
      {
        name: 'confirm-create-okr',
        description:
          'After the user explicitly approves a proposal in natural language, call this tool to create an OKR with objective and key results.',
        schema: z.object({
          objectiveTitle: z.string().describe('The title for the objective'),
          objectiveTimeline: z
            .enum(['this-quarter', 'next-quarter', 'past', 'later'])
            .describe(
              'The timeline for the objective: this-quarter, next-quarter, past, or later',
            )
            .optional(),
          keyResults: z
            .array(z.string())
            .describe(
              'Array of key result titles to create with this objective',
            )
            .optional(),
        }),
      },
    );
  }

  private confirmAndUpdateOkr(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    return tool(
      async ({
        objectiveId,
        objectiveTitle,
        objectiveStatus,
        objectiveTimeline,
        newKeyResults,
      }) => {
        try {
          // First, update the objective
          const updateObjectiveDto = {
            title: objectiveTitle,
            status: objectiveStatus,
            timeline: objectiveTimeline,
            assignedTo: userId,
          };

          const updatedOkr = await this.okrsService.updateObjective(
            orgId,
            projectId,
            objectiveId,
            updateObjectiveDto,
          );

          // Then, if new key results provided, create them
          let createdKeyResults = [];
          if (newKeyResults && newKeyResults.length > 0) {
            createdKeyResults = await Promise.all(
              newKeyResults.map(async (title) => {
                const keyResultDto = {
                  title: title,
                  progress: 0,
                  status: 'not-started',
                };
                return await this.okrsService.createKeyResult(
                  orgId,
                  objectiveId,
                  keyResultDto,
                );
              }),
            );
          }

          let output = `
          Successfully updated OKR!
          
          Updated Objective Details:
          - ID: ${updatedOkr.objective.id}
          - Title: ${updatedOkr.objective.title}
          - Status: ${updatedOkr.objective.status}
          - Timeline: ${objectiveTimeline || 'unchanged'}
          - Progress: ${Math.round(updatedOkr.objective.progress * 100)}%
          `;

          if (createdKeyResults.length > 0) {
            output += '\nNewly Added Key Results:\n';
            for (const kr of createdKeyResults) {
              output += `- ID: ${kr.id}\n  Title: ${kr.title}\n  Status: ${kr.status}\n`;
            }
          }

          return output;
        } catch (e) {
          return 'Failed to update OKR: ' + (e as any).message;
        }
      },
      {
        name: 'confirm-update-okr',
        description:
          'After the user explicitly approves an OKR update in natural language, call this tool to update the objective and optionally add new key results.',
        schema: z.object({
          objectiveId: z.string().describe('The ID of the objective to update'),
          objectiveTitle: z
            .string()
            .describe('The updated title for the objective'),
          objectiveStatus: z
            .enum([
              'on-track',
              'off-track',
              'at-risk',
              'ahead-of-schedule',
              'completed',
              'stalled',
              'deferred',
              'canceled',
              'under-review',
              'needs-attention',
            ])
            .describe('The updated status for the objective'),
          objectiveTimeline: z
            .enum(['this-quarter', 'next-quarter', 'past', 'later', 'current'])
            .describe('The updated timeline for the objective')
            .optional(),
          newKeyResults: z
            .array(z.string())
            .describe('Array of new key result titles to add to this objective')
            .optional(),
        }),
      },
    );
  }

  private confirmAndUpdateKeyResult(orgId: string, projectId: string) {
    return tool(
      async ({
        keyResultId,
        keyResultTitle,
        keyResultProgress,
        keyResultStatus,
      }) => {
        try {
          // Find the key result with its objective to get the objectiveId
          const keyResult = await this.keyResultRepository.findOneOrFail({
            where: {
              id: keyResultId,
              org: { id: orgId },
              project: { id: projectId },
            },
            relations: ['objective'],
          });

          const objective = await keyResult.objective;

          const patchKeyResultDto = {
            title: keyResultTitle,
            progress:
              keyResultProgress !== undefined
                ? keyResultProgress / 100
                : undefined,
            status: keyResultStatus,
          };

          const updatedKeyResult = await this.okrsService.patchKeyResult(
            orgId,
            projectId,
            objective.id,
            keyResultId,
            patchKeyResultDto,
          );

          return `
          Successfully updated key result!
          
          Updated Key Result Details:
          - ID: ${updatedKeyResult.id}
          - Title: ${updatedKeyResult.title}
          - Progress: ${Math.round(updatedKeyResult.progress * 100)}%
          - Status: ${updatedKeyResult.status}
          - Objective: ${objective.title} (ID: ${objective.id})
          `;
        } catch (e) {
          return 'Failed to update key result: ' + (e as any).message;
        }
      },
      {
        name: 'update-key-result',
        description:
          'After the user explicitly approves a key result update in natural language, call this tool to update the key result.',
        schema: z.object({
          keyResultId: z
            .string()
            .describe('The ID of the key result to update'),
          keyResultTitle: z
            .string()
            .describe('The updated title for the key result')
            .optional(),
          keyResultProgress: z
            .number()
            .min(0)
            .max(100)
            .describe('The updated progress for the key result (0-100)')
            .optional(),
          keyResultStatus: z
            .enum([
              'on-track',
              'off-track',
              'at-risk',
              'ahead-of-schedule',
              'completed',
              'stalled',
              'deferred',
              'canceled',
              'under-review',
              'needs-attention',
            ])
            .describe('The updated status for the key result')
            .optional(),
        }),
      },
    );
  }
}
