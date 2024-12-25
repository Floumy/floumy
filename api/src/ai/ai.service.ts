import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { Initiative, KeyResult, WorkItem } from './types';

@Injectable()
export class AiService {
  constructor(private openaiService: OpenaiService) {}

  async generateDescriptionForInitiative(initiative: string): Promise<string> {
    const prompt = `Generate a description for the following initiative:
    
    Initiative: ${initiative}
        
    Include:
    - What is the goal of the initiative?
    - Why is it important?
    - What are the key results that will be achieved by the initiative?
    - What are the steps to achieve the key results?
    - What are the resources needed to achieve the key results?
    - What is the expected outcome of the initiative?
    - Any other relevant information
    
    Keep the response concise and to the point.
    
    Format the response as a JSON object with a "description" string.`;

    const response = await this.openaiService.generateCompletion<{
      description: string;
    }>(prompt);
    return response.data.description;
  }

  async generateDescriptionForWorkItem(workItem: string): Promise<string> {
    const prompt = `Generate a description for the following work item:
    
    Work Item: ${workItem}
    Include:
    - What is the goal of the work item?
    - What are the steps to complete the work item?
    - What are the resources needed to complete the work item?
    - What is the expected outcome of the work item?
    - Implementation details
    - Acceptance criteria
    - Any other relevant information
    
    Keep the response concise and to the point.
    
    Format the response as a JSON object with a "description" string.`;

    const response = await this.openaiService.generateCompletion<{
      description: string;
    }>(prompt);
    return response.data.description;
  }

  async generateKeyResults(objective: string): Promise<KeyResult[]> {
    const prompt = `Generate 2-3 key results for the following objective:
    
    Objective: ${objective}

    For each key result, include only:
    - Title
    
    Do not include any timelines or deadlines.
    Make the key results specific and measurable.

    Format the response as a JSON object with an "keyResults" array of strings.`;

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
    - Priority (high/medium/low)
    
    Format the response as a JSON object with an "initiatives" array of strings.`;

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
    - Type (user story/task/bug/spike)
    - Priority (high/medium/low)

    Format the response as a JSON object with a "workItems" array with the structure:
    {
      title: string;
      type: string;
      priority: string;
    }
    `;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItem[];
    }>(prompt);
    return response.data.workItems;
  }
}
