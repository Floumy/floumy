import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { InitiativeType, KeyResultType } from './types';

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
}
