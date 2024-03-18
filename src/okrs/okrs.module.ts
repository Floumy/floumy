import { Module } from '@nestjs/common';
import { OkrsService } from './okrs.service';
import { OkrsController } from './okrs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './objective.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { AuthModule } from '../auth/auth.module';
import { KeyResult } from './key-result.entity';
import { Feature } from '../roadmap/features/feature.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Objective, KeyResult, Feature, User]),
    OrgsModule,
    AuthModule,
  ],
  providers: [OkrsService],
  controllers: [OkrsController],
  exports: [OkrsService],
})
export class OkrsModule {}
