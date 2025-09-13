import { Injectable } from '@nestjs/common';
import { AIMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class AgentService {
  private makeWorkerNode(agent: any, systemPrompt: string) {
    return async (state: { messages: Array<any> }) => {
      const response = await agent.invoke({
        messages: [new SystemMessage(systemPrompt)],
      });
      const last = Array.isArray(response?.messages)
        ? response.messages[response.messages.length - 1]
        : new AIMessage(
            typeof response === 'string' ? response : JSON.stringify(response),
          );
      return { messages: [...state.messages, last] };
    };
  }

  private supervisorNode(state: any) {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find((m: any) => m._getType?.() === 'human');
    const text = (lastUserMessage?.content ?? '').toLowerCase();
    let next = 'finalize';
    if (text.includes('work-item')) {
      next = 'work-item';
    } else if (text.includes('initiative')) {
      next = 'initiative';
    }
    return { ...state, next };
  }
}
