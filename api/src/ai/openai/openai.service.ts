import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
export class OpenaiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateCompletion<T>(
    prompt: string,
    options: {
      temperature?: number;
      model?: string;
    } = {},
  ): Promise<AIResponse<T>> {
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: options.model || 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
      temperature: options.temperature || 0.7,
    });

    const response = JSON.parse(completion.choices[0].message.content);

    return {
      data: response,
      model: completion.model,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      },
    };
  }
}
