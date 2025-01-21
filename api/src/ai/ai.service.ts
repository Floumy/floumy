import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { InitiativeType, KeyResultType, WorkItemType } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { Repository } from 'typeorm';
import { Feature } from '../roadmap/features/feature.entity';
import { Issue } from '../issues/issue.entity';

@Injectable()
export class AiService {
  constructor(
    private openaiService: OpenaiService,
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  async generateKeyResults(objective: string): Promise<KeyResultType[]> {
    const prompt = `Generate up to 5 key results for the following objective:
    
    Objective: ${objective}

    For each key result, include only:
    - Title
    
    Have a preference for a lower number of key results.
    
    Do not include any timelines or deadlines or money amounts.
    Make the key results specific and measurable.
    Make sure the key results are clear and concise.
    Do not include any unnecessary details.
    Keep the key results short and to the point.`;

    const response = await this.openaiService.generateCompletion<{
      keyResults: KeyResultType[];
    }>(prompt, {
      name: 'keyResults',
      schema: {
        type: 'object',
        properties: {
          keyResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
              },
              required: ['title'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['keyResults'],
        additionalProperties: false,
      },
    });
    return response.data.keyResults;
  }

  async generateInitiativesForOKR(objective: string, keyResult: string) {
    const prompt = `Generate up to 5 initiatives to achieve the following objective and key result:
    
    Objective: ${objective}
    Key Result: ${keyResult}

    For each initiative, include:
    - Title
    - Description
    - Priority (high/medium/low)
    
    In the description, include:
    - What is the goal of the initiative?
    - Why is it important?
    - What is the expected outcome of the initiative?
   
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.`;

    const response = await this.openaiService.generateCompletion<{
      initiatives: InitiativeType[];
    }>(prompt, {
      name: 'initiatives',
      schema: {
        type: 'object',
        properties: {
          initiatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
              },
              required: ['title', 'description', 'priority'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['initiatives'],
        additionalProperties: false,
      },
    });
    return response.data.initiatives;
  }

  async generateInitiativesForFeatureRequest(
    featureRequest: string,
    featureRequestDescription: string,
  ) {
    const prompt = `Generate up to 3 initiatives to achieve the following feature request:
    
    Feature Request: ${featureRequest}
    Description: ${featureRequestDescription}

    For each initiative, include:
    - Title
    - Description
    - Priority (high/medium/low)
    
    In the description, include:
    - What is the goal of the initiative?
    - Why is it important?
    - What is the expected outcome of the initiative?
    
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.`;

    const response = await this.openaiService.generateCompletion<{
      initiatives: InitiativeType[];
    }>(prompt, {
      name: 'initiatives',
      schema: {
        type: 'object',
        properties: {
          initiatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
              },
              required: ['title', 'description', 'priority'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 3,
          },
        },
        required: ['initiatives'],
        additionalProperties: false,
      },
    });
    return response.data.initiatives;
  }

  async generateWorkItemsForInitiative(
    initiative: string,
    description: string,
  ) {
    const prompt = `Generate up to 5 work items for the following initiative:
    
    Initiative: ${initiative}
    Description: ${description}
    
    For each work item, include:
    - Title
    - Type (user-story/task/spike)
    - Priority (high/medium/low)
    - Description
    
    Prefer to use the following types in this order: user-story, task, spike
    
    As much as possible, slice the work items so that they are not dependent on each other.
        
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.
    `;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItemType[];
    }>(prompt, {
      name: 'workItems',
      schema: {
        type: 'object',
        properties: {
          workItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
              required: ['title', 'type', 'priority', 'description'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['workItems'],
        additionalProperties: false,
      },
    });
    return response.data.workItems;
  }

  async generateWorkItemsForIssue(issue: string, description: string) {
    const prompt = `Generate up to 3 work items for the following issue:
    
    Issue: ${issue}
    Description: ${description}

    For each work item, include:
    - Title
    - Type (user-story/task/bug/spike)
    - Priority (high/medium/low)
    - Description
    
    Prefer to use the following types in this order: task, bug, user-story, spike
    
    As much as possible, slice the work items so that they are not dependent on each other.
        
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.
    `;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItemType[];
    }>(prompt, {
      name: 'workItems',
      schema: {
        type: 'object',
        properties: {
          workItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
              required: ['title', 'type', 'priority', 'description'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['workItems'],
        additionalProperties: false,
      },
    });
    return response.data.workItems;
  }

  async generateWorkItemDescription(
    workItem: string,
    workItemType: string,
    initiativeId: string,
    issueId: string,
  ) {
    let prompt = `Generate a description for the following work item:
    
    Work Item Title: ${workItem}
    Work Item Type: ${workItemType}
    `;
    if (initiativeId) {
      const initiative = await this.featureRepository.findOneOrFail({
        where: { id: initiativeId },
      });
      prompt += `Linked Initiative title: ${initiative.title}
      Linked Initiative description: ${initiative.description}
      `;
    }
    if (issueId) {
      const issue = await this.issueRepository.findOneOrFail({
        where: { id: issueId },
      });
      prompt += `Linked Issue title: ${issue.title}
      Linked Issue description: ${issue.description}
      `;
    }
    prompt += `
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Format the description as an HTML string.
    `;

    const response = await this.openaiService.generateCompletion<{
      description: string;
    }>(prompt, {
      name: 'workItemDescription',
      schema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
        },
        required: ['description'],
        additionalProperties: false,
      },
    });
    return response.data.description;
  }
}
