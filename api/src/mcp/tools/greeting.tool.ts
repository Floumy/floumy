import { Injectable } from '@nestjs/common';

import { z } from 'zod';
import { Context, Resource, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';

@Injectable()
export class GreetingTool {
  @Tool({
    name: 'hello-world',
    description:
      'Returns a greeting and simulates a long operaiton with progress updates',
    parameters: z.object({
      name: z.string().default('World'),
    }),
  })
  async sayHello({ name }, context: Context, request: Request) {
    const userAgent = request.get('user-agent') || 'Unknown';
    const greeting = `Hello ${name}! Your user agent is ${userAgent}`;

    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      await context.reportProgress({
        progress: (i + 1) * 20,
        total: 100,
      });
    }

    return {
      content: [{ type: 'text', text: greeting }],
    };
  }

  @Resource({
    uri: 'mcp://hello-world/{userName}',
    name: 'Hello World',
    description: 'A simple greeting resource',
    mimeType: 'text/plain',
  })
  async getCurrentSchema({ uri, userName }) {
    return {
      content: [{ uri, text: `User is ${userName}`, mimeType: 'text/plain' }],
    };
  }
}
