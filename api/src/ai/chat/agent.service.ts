import { Injectable } from '@nestjs/common';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import {
  CompiledStateGraph,
  END,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { WorkItemsToolsService } from './tools/work-items-tools.service';
import { Observable } from 'rxjs';

export interface AIResponse<T> {
  data: T;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class AgentService {
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private workItemsToolsService: WorkItemsToolsService,
  ) {
    this.apiKey = this.configService.get('ai.apiKey');
  }

  private buildWorkerNode(agent: any, systemPrompt: string) {
    return async (state: { messages: Array<any> }) => {
      const response = await agent.invoke({
        messages: [new SystemMessage(systemPrompt)],
      });
      const last = Array.isArray(response?.messages)
        ? response.messages[response.messages.length - 1]
        : new AIMessage(
            typeof response === 'string' ? response : JSON.stringify(response),
          );
      return { ...state, messages: [...state.messages, last] };
    };
  }

  private async supervisorNode(state: any) {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find((m: any) => m._getType?.() === 'human');
    const text = (lastUserMessage?.content ?? '').toLowerCase();
    let next = 'finalize';
    if (text.includes('work_items')) {
      next = 'work_items';
    }
    return { ...state, next };
  }

  async finalizeNode(state: any) {
    return state;
  }

  async workItemsNode(orgId: string, projectId: string, userId: string) {
    const model = new ChatOpenAI({
      model: 'gpt-4o',
      openAIApiKey: this.apiKey,
      temperature: 0.1,
      // callbacks: [new ConsoleCallbackHandler()],
    });

    const agent = createReactAgent({
      llm: model,
      tools: this.workItemsToolsService.getTools(orgId, projectId, userId),
    });

    return this.buildWorkerNode(agent, 'Work item agent');
  }

  async buildMultiAgentGraph(orgId: string, projectId: string, userId: string) {
    type GraphState = {
      messages: Array<any>;
      next?: 'work_items' | 'finalize';
    };

    return new StateGraph<GraphState>({
      channels: {
        messages: {
          value: (a, b) => [...(a ?? []), ...(b ?? [])],
          default: () => [],
        },
        next: { value: (_a, b) => b, default: () => undefined },
      },
    })
      .addNode('supervisor', this.supervisorNode)
      .addNode('work_items', await this.workItemsNode(orgId, projectId, userId))
      .addNode('finalize', this.finalizeNode)
      .addEdge(START, 'supervisor')
      .addConditionalEdges('supervisor', (state) => state.next!, {
        work_items: 'work_items',
        finalize: 'finalize',
      })
      .addEdge('work_items', 'supervisor')
      .addEdge('finalize', END)
      .compile();
  }

  streamMultiAgentAsObservable(
    graph: any,
    userInput: string,
    priorMessages: any[],
    options?: { modelId?: string },
  ): Observable<AIResponse<{ textDelta: string }>> {
    const modelId = options?.modelId ?? 'gpt-4o';

    return new Observable((subscriber) => {
      let cancelled = false;

      (async () => {
        try {
          const initial = {
            messages: [
              new SystemMessage(
                `You are a helpful project management assistant.
                  Respond only in markdown format.
                  Only ask follow-up questions when necessary to understand the request or provide a useful response.
                  If clarification is needed, ask a single, specific question.
                  Ignore unrelated topics.
                  
                  Important policy: You must obtain explicit human approval before creating or updating anything. First, propose the item details (title, type, description, etc.) and wait for the user's clear approval in natural language (e.g., “yes”, “looks good”, “go ahead”). Only after explicit approval should you call the confirm tool to create the item.
                  
                  Example behavior:

                  If the user says:
                  
                  Help me define OKRs
                  
                  The assistant could reply:
                  
                  Sure. What’s the main goal or focus area you’re working on?`,
              ),
              ...priorMessages,
              new HumanMessage(userInput),
            ],
          };

          const stream = await graph.stream(initial, {
            streamMode: 'messages',
          });

          for await (const record of stream) {
            if (cancelled) break;
            const chunk = record?.[0];
            if (chunk instanceof AIMessageChunk) {
              subscriber.next({
                data: { textDelta: String(chunk.content) },
                model: modelId,
              });
            }
          }

          if (!cancelled) subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();

      // Teardown
      return () => {
        cancelled = true;
      };
    });
  }
}
