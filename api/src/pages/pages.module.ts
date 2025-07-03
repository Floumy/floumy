import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './pages.entity';
import { Project } from '../projects/project.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Project, User]), AuthModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
