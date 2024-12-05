import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { PublicController } from './public/public.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { PublicService } from './public/public.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Project, User, Org]),
    UsersModule,
    AuthModule,
  ],
  providers: [ProjectsService, PublicService],
  controllers: [ProjectsController, PublicController],
})
export class ProjectsModule {}
