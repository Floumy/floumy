import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { InitiativeType, KeyResultType, WorkItemType } from './types';

@Injectable()
export class AiService {
  constructor(private openaiService: OpenaiService) {}

  async generateKeyResults(objective: string): Promise<KeyResultType[]> {
    const prompt = `Generate up to 5 key results for the following objective:
    
    Objective: ${objective}

    For each key result, include only:
    - Title
    
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
    
    The user story should have in its description the following with the headings in bold and the sections in italic:
    As a [role], I want to [goal] so that [benefit].
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
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
    
    The user story should have in its description the following with the headings in bold and the sections in italic:
    As a [role], I want to [goal] so that [benefit].
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
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
}
