import { Module } from '@nestjs/common';
import { GitlabService } from './gitlab.service';
import { GitlabController } from './gitlab.controller';
import { EncryptionModule } from '../encryption/encryption.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { Project } from '../projects/project.entity';
import { WorkItem } from '../backlog/work-items/work-item.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [GitlabService],
  controllers: [GitlabController],
  imports: [
    ConfigModule,
    EncryptionModule,
    TypeOrmModule.forFeature([User, User, Org, Project, WorkItem]),
  ],
})
export class GitlabModule {}
