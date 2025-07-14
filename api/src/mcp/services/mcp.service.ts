import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class McpService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUserFromRequest(request: Request): Promise<User | null> {
    const mcpToken = request.get('floumy-user-token');
    console.log('MCP Token:', mcpToken);
    if (!mcpToken) {
      return null;
    }

    const user = await this.usersRepository.findOne({
      where: { mcpToken },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
