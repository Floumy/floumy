import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { KeyResultType } from './types';

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
}
