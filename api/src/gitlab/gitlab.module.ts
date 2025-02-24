import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';

@Module({
  providers: [GitlabService],
  controllers: [GitlabController],
})
export class GitlabModule {}
