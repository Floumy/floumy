import { Module } from '@nestjs/common';
import { FeatureRequestsService } from './feature-requests.service';
import { FeatureRequestsController } from './feature-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Org } from '../orgs/org.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { FeatureRequest } from './feature-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Org, FeatureRequest]),
    OrgsModule,
    AuthModule,
  ],
  providers: [FeatureRequestsService],
  controllers: [FeatureRequestsController],
})
export class FeatureRequestsModule {}
