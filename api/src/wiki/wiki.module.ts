import { Module } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiController } from './wiki.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiPage } from './wiki-page.entity';
import { Project } from '../projects/project.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WikiPage, Project, User]), AuthModule],
  controllers: [WikiController],
  providers: [WikiService],
  exports: [WikiService],
})
export class WikiModule {}
