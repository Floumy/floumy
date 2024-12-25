import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenaiService } from './openai/openai.service';
import { ConfigModule } from '@nestjs/config';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [ConfigModule, RoadmapModule],
  controllers: [AiController],
  providers: [AiService, OpenaiService],
})
export class AiModule {}
