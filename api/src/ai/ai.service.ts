import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { InitiativeType, KeyResultType, WorkItemType } from './types';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyResult } from '../okrs/key-result.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { Priority } from '../common/priority.enum';
import { User } from '../users/user.entity';
import { FeatureMapper } from '../roadmap/features/feature.mapper';

@Injectable()
export class AiService {
  constructor(
    private openaiService: OpenaiService,
    @InjectRepository(KeyResult)
    private keyResultsRepository: Repository<KeyResult>,
    @InjectRepository(Feature)
    private initiativesRepository: Repository<Feature>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async generateDescriptionForInitiative(initiative: string): Promise<string> {
    const prompt = `Generate a description for the following initiative:
    
    Initiative: ${initiative}
        
    Include:
    - What is the goal of the initiative?
    - Why is it important?
    - What is the expected outcome of the initiative?
    
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

  async generateKeyResults(objective: string): Promise<KeyResultType[]> {
    const prompt = `Generate 2-3 key results for the following objective:
    
    Objective: ${objective}

    For each key result, include only:
    - Title
    
    Do not include any timelines or deadlines.
    Make the key results specific and measurable.

    Format the response as a JSON object with an "keyResults" array of strings.`;

    const response = await this.openaiService.generateCompletion<{
      keyResults: KeyResultType[];
    }>(prompt);
    return response.data.keyResults;
  }

  async generateInitiatives(
    objective: string,
    keyResult: string,
  ): Promise<InitiativeType[]> {
    const prompt = `Generate 2-3 initiatives to achieve the following objective and key result:
    
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
    
    Format the description as an HTML string.
    
    Format the response as a JSON object with an "initiatives" array of with the structure:
    {
      title: string;
      description: string;
      priority: string;
    }
    `;

    const response = await this.openaiService.generateCompletion<{
      initiatives: InitiativeType[];
    }>(prompt);
    return response.data.initiatives;
  }

  async generateWorkItems(initiative: string): Promise<WorkItemType[]> {
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
      workItems: WorkItemType[];
    }>(prompt);
    return response.data.workItems;
  }

  toPriority(str: string): Priority {
    // Convert to uppercase to match enum values
    const upperStr = str.toUpperCase();

    // Check if valid priority value
    if (upperStr in Priority) {
      return Priority[upperStr as keyof typeof Priority];
    }

    // Handle invalid values
    throw new Error(`Invalid priority: ${str}`);
  }

  async addInitiativesForKeyResult(userId: string, keyResultId: string) {
    const createdBy = await this.usersRepository.findOneByOrFail({
      id: userId,
    });
    const keyResult = await this.keyResultsRepository.findOneByOrFail({
      id: keyResultId,
    });
    const org = await keyResult.org;
    const project = await keyResult.project;
    const objective = await keyResult.objective;
    const generatedInitiatives = await this.generateInitiatives(
      objective.title,
      keyResult.title,
    );

    const newInitiatives = generatedInitiatives.map((initiative) => {
      const feature = new Feature();
      feature.title = initiative.title;
      feature.description = initiative.description;
      feature.priority = this.toPriority(initiative.priority);
      return feature;
    });

    await Promise.all(
      newInitiatives.map(async (initiative) => {
        initiative.keyResult = Promise.resolve(keyResult);
        initiative.org = Promise.resolve(org);
        initiative.project = Promise.resolve(project);
        initiative.createdBy = Promise.resolve(createdBy);
        await this.initiativesRepository.save(initiative);
      }),
    );

    const savedInitiatives = await this.initiativesRepository.findBy({
      keyResult: { id: keyResultId },
    });

    return FeatureMapper.toListDto(savedInitiatives);
  }
}
