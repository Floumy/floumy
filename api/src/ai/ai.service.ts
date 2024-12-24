import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';

@Injectable()
export class AiService {
  constructor(private openaiService: OpenaiService) {}

  async generateKeyResults(objective: string): Promise<KeyResult[]> {
    const prompt = `Generate 2-3 key results for the following objective:
    
    Objective: ${objective}

    For each key result, include:
    - Title

    Format the response as a JSON object with an "okrs" array.`;

    const response = await this.openaiService.generateCompletion<{
      keyResults: KeyResult[];
    }>(prompt);
    return response.data.keyResults;
  }

  async generateInitiatives(
    objective: string,
    keyResults: string[],
  ): Promise<Initiative[]> {
    const prompt = `Generate 2-3 initiatives to achieve the following objective and key results:
    
    Objective: ${objective}
    Key Results:
    ${keyResults.map((kr) => `- ${kr}`).join('\n')}

    For each initiative, include:
    - Title
    - Description
    - Priority (high/medium/low)

    Format the response as a JSON object with an "initiatives" array.`;

    const response = await this.openaiService.generateCompletion<{
      initiatives: Initiative[];
    }>(prompt);
    return response.data.initiatives;
  }

  async generateWorkItems(initiative: string): Promise<WorkItem[]> {
    const prompt = `Generate 3-5 work items for the following initiative:
    
    Initiative: ${initiative}

    For each work item, include:
    - Title
    - Description
    - Priority (high/medium/low)
    - Story points (fibonacci: 1,2,3,5,8,13)

    Format the response as a JSON object with a "workItems" array.`;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItem[];
    }>(prompt);
    return response.data.workItems;
  }
}
