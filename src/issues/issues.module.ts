import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { Issue } from './issue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Org, Issue]),
    OrgsModule,
    AuthModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
