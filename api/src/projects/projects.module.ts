import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Project, User, Org]),
    UsersModule,
    AuthModule,
    FilesModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
