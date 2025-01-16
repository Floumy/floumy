import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.guard';

@Controller('github')
@UseGuards(AuthGuard)
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('auth')
  async getAuthUrl() {
    return await this.githubService.getAuthUrl();
  }

  @Get('auth/callback')
  @Public()
  async handleOAuthCallback(@Query('code') code: string) {
    return await this.githubService.handleOAuthCallback(code);
  }
}
