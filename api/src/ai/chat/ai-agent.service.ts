import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { WorkItemsToolsService } from './tools/work-items-tools.service';
import { InitiativesToolsService } from './tools/initiatives-tools.service';
import { MilestonesToolsService } from './tools/milestones-tools.service';
import { OkrsToolsService } from './tools/okrs-tools.service';
import { SprintsToolsService } from './tools/sprints-tools.service';
import { ConfigService } from '@nestjs/config';
import { SystemMessage } from '@langchain/core/messages';

@Injectable()
export class AiAgentService {
  private readonly apiKey: string;

  constructor(
    private workItemsToolsService: WorkItemsToolsService,
    private initiativesToolsService: InitiativesToolsService,
    private milestonesToolsService: MilestonesToolsService,
    private okrsToolsService: OkrsToolsService,
    private sprintsToolsService: SprintsToolsService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  getChatAgent(orgId: string, projectId: string, userId: string) {
    const model = new ChatOpenAI({
      model: 'gpt-4o',
      openAIApiKey: this.apiKey,
      streaming: true,
      // callbacks: [new ConsoleCallbackHandler()],
    });
    return createReactAgent({
      llm: model,
      tools: [
        ...this.workItemsToolsService.getTools(orgId, projectId, userId),
        ...this.initiativesToolsService.getTools(orgId, projectId, userId),
        ...this.milestonesToolsService.getTools(orgId, projectId),
        ...this.okrsToolsService.getTools(orgId, projectId, userId),
        ...this.sprintsToolsService.getTools(orgId, projectId),
      ],
      prompt: new SystemMessage(
        `You are a helpful project management assistant.
                The current date is ${new Date().toISOString()}
                Respond only in markdown format.
                Only ask follow-up questions when necessary to understand the request or provide a useful response.
                If clarification is needed, ask a single, specific question.
                Be proactive in giving suggestions for when the user wants to update or create things.
                Ignore unrelated topics.
                
                Important policies: 
                - You must obtain explicit human approval before creating or updating anything. First, propose the item details (title, type, description, etc.) and wait for the user's clear approval in natural language (e.g., “yes”, “looks good”, “go ahead”). Only after explicit approval should you call the confirm tool to create the item.
                - When asked to update a specific entity get its details first and try to propose changes based on existing content
                - When asked about the roadmap, use the milestones tools because the roadmap is a series of milestones
                - When asked to create a roadmap, find existing milestones and propose new ones to associate with the initiatives provided
                - When returning information about created or updated entities, always include the reference
                
                Entities relationship information:
                - OKRs are composed of Objectives and Key Results
                - Each Key result can have initiatives
                - Each initiative can be associated with one milestone
                - A set of milestones with deadlines within a certain quarter are defining the roadmap for that quarter
                - Each initiative can have work items
                - Work items can be added to sprints
                - There is only one active sprint at a time
                - The work items backlog contains work items that are not closed or done and are not part of a sprint
                - The initiatives backlog contains initiatives that are not closed or completed and are not part of a milestone
                
                Example behavior:

                If the user says:
                
                Help me define OKRs
                
                The assistant could reply:
                
                Sure. What’s the main goal or focus area you’re working on?
                `,
      ),
    });
  }
}
