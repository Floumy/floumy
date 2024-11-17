import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FilesStorageRepository } from './files-storage.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { S3Client } from '@aws-sdk/client-s3';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { Org } from '../orgs/org.entity';
import { WorkItemFile } from '../backlog/work-items/work-item-file.entity';
import { FeatureFile } from '../roadmap/features/feature-file.entity';
import { User } from '../users/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { OrgsModule } from '../orgs/orgs.module';

const s3ClientProvider = {
  provide: 'S3_CLIENT',
  useFactory: (configService: ConfigService) => {
    const configuration = {
      endpoint: configService.get('fileStorage.endpoint'),
      forcePathStyle: configService.get('fileStorage.forcePathStyle'),
      region: configService.get('fileStorage.region'),
      credentials: {
        accessKeyId: configService.get('fileStorage.credentials.accessKeyId'),
        secretAccessKey: configService.get(
          'fileStorage.credentials.secretAccessKey',
        ),
      },
    };
    return new S3Client(configuration);
  },
  inject: [ConfigService],
};

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesStorageRepository, s3ClientProvider],
  imports: [
    CacheModule.register(),
    ConfigModule,
    AuthModule,
    UsersModule,
    OrgsModule,
    TypeOrmModule.forFeature([Org, File, WorkItemFile, FeatureFile, User]),
  ],
  exports: [FilesService],
})
export class FilesModule {}
