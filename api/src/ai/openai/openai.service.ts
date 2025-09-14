import { Injectable } from '@nestjs/common';
import floumySystemPrompt from './prompts';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ZodSchema } from 'zod';

@Injectable()
export class OpenaiService {
  async generateCompletion<T>(
    prompt: string,
    schema: ZodSchema,
    options: {
      temperature?: number;
      model?: string;
    } = {},
  ): Promise<T> {
    const { object } = await generateObject({
      model: openai(options?.model || 'gpt-5-mini'),
      schema: schema,
      system: floumySystemPrompt,
      prompt,
    });

    return object;
  }
}
