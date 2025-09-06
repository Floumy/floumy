import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OkrsModule } from './okrs/okrs.module';
import { OrgsModule } from './orgs/orgs.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { BacklogModule } from './backlog/backlog.module';
import { SprintsModule } from './sprints/sprints.module';
import { FilesModule } from './files/files.module';
import { MailNotificationsModule } from './mail-notifications/mail-notifications.module';
import databaseConfig from './config/database.config';
import encryptionConfig from './config/encryption.config';
import jwtConfig from './config/jwt.config';
import fileStorageConfig from './config/file-storage.config';
import emailConfig from './config/mail.config';
import appConfig from './config/app.config';
import aiConfig from './config/ai.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { BipModule } from './bip/bip.module';
import { FeedModule } from './feed/feed.module';
import { FeatureRequestsModule } from './feature-requests/feature-requests.module';
import { IssuesModule } from './issues/issues.module';
import { ProjectsModule } from './projects/projects.module';
import { AiModule } from './ai/ai.module';
import { NotificationModule } from './notifications/notification.module';
import { GithubModule } from './github/github.module';
import { EncryptionModule } from './encryption/encryption.module';
import { GitlabModule } from './gitlab/gitlab.module';
import githubConfig from './config/github.config';
import gitlabConfig from './config/gitlab.config';
import { PagesModule } from './pages/pages.module';
import { FloumyMcpModule } from './mcp/mcp.module';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      load: [
        databaseConfig,
        encryptionConfig,
        jwtConfig,
        fileStorageConfig,
        emailConfig,
        appConfig,
        aiConfig,
        githubConfig,
        gitlabConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        let settings: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('database.host'),
          port: +configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: true,
          synchronize: false,
          logging: false,
        };

        if (configService.get('database.ssl')) {
          settings = {
            ...settings,
            ssl: {
              rejectUnauthorized: true,
              ca: configService.get('database.sslCertificate'),
            },
          };
        }

        return settings;
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    EncryptionModule,
    AuthModule,
    UsersModule,
    OkrsModule,
    OrgsModule,
    RoadmapModule,
    BacklogModule,
    SprintsModule,
    FilesModule,
    MailNotificationsModule,
    BipModule,
    FeedModule,
    FeatureRequestsModule,
    IssuesModule,
    ProjectsModule,
    AiModule,
    NotificationModule,
    GithubModule,
    GitlabModule,
    PagesModule,
    FloumyMcpModule,
  ],
})
export class AppModule {}
