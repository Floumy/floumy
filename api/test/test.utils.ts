import { Test, TestingModule } from '@nestjs/testing';
import { jwtModule } from './jwt.test-module';
import { typeOrmModule } from './typeorm.test-module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import databaseConfig from '../src/config/database.config';
import encryptionConfig from '../src/config/encryption.config';
import jwtConfig from '../src/config/jwt.config';
import { testDbOptions } from './test-db.options';
import { MailNotificationsService } from '../src/mail-notifications/mail-notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { RefreshToken } from '../src/auth/refresh-token.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { StripeService } from '../src/stripe/stripe.service';
import { OrgsService } from '../src/orgs/orgs.service';
import { Org } from '../src/orgs/org.entity';
import { TokensService } from '../src/auth/tokens.service';
import { WorkItemComment } from '../src/backlog/work-items/work-item-comment.entity';
import { InitiativeComment } from '../src/roadmap/initiatives/initiative-comment.entity';
import { KeyResultComment } from '../src/okrs/key-result-comment.entity';
import { CommentsService } from '../src/okrs/comments/comments.service';
import { KeyResult } from '../src/okrs/key-result.entity';
import { ObjectiveComment } from '../src/okrs/objective-comment.entity';
import { Objective } from '../src/okrs/objective.entity';
import { FeatureRequestComment } from '../src/feature-requests/feature-request-comment.entity';
import { FeatureRequestVote } from '../src/feature-requests/feature-request-vote.entity';
import { FeatureRequest } from '../src/feature-requests/feature-request.entity';
import { Issue } from '../src/issues/issue.entity';
import { IssueComment } from '../src/issues/issue-comment.entity';
import { Project } from '../src/projects/project.entity';
import { Milestone } from '../src/roadmap/milestones/milestone.entity';
import { WorkItem } from '../src/backlog/work-items/work-item.entity';
import { Initiative } from '../src/roadmap/initiatives/initiative.entity';
import { githubClientMock } from './github-client.mock';

const dataSource = new DataSource(testDbOptions);

export async function clearDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Get all table names except migrations and typeorm metadata
    const tables = await queryRunner.query(`
        SELECT string_agg('"' || tablename || '"', ', ')
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('migrations', 'typeorm_metadata');
    `);

    if (tables[0].string_agg) {
      // Disable triggers and truncate all tables in a single query
      await queryRunner.query('SET session_replication_role = replica;');
      await queryRunner.query(
        `TRUNCATE TABLE ${tables[0].string_agg} CASCADE;`,
      );
      await queryRunner.query('SET session_replication_role = DEFAULT;');
    }
  } finally {
    await queryRunner.release();
  }
}

export async function setupTestingModule(
  imports: any[],
  providers: any[],
  controllers: any[] = [],
) {
  const s3ClientMock = {
    send: jest.fn().mockImplementation(() => ({
      $metadata: {
        httpStatusCode: 200,
      },
      Location: 'https://test-bucket.nyc3.digitaloceanspaces.com',
    })),
  };
  const postmarkClientMock = {
    sendEmail: jest.fn().mockImplementation(() => {}),
  };
  const stripeClientMock = {
    webhooks: {
      constructEvent: jest.fn().mockImplementation(() => {}),
    },
    subscriptions: {
      list: jest.fn().mockImplementation(() => {
        return {
          data: [],
        };
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation(() => {
          return {
            url: 'https://checkout.stripe.com/checkout/session',
          };
        }),
      },
    },
    customers: {
      create: jest.fn().mockImplementation(() => {
        return {
          id: 'cus_test',
        };
      }),
    },
    invoices: {
      retrieve: jest.fn().mockImplementation(() => {
        return {
          id: 'in_test',
          invoice_pdf: 'https://stripe.com/invoice.pdf',
        };
      }),
    },
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers,
    imports: [
      CacheModule.register(),
      jwtModule,
      typeOrmModule,
      TypeOrmModule.forFeature([
        User,
        RefreshToken,
        Org,
        WorkItemComment,
        InitiativeComment,
        KeyResultComment,
        ObjectiveComment,
        KeyResult,
        Objective,
        FeatureRequest,
        FeatureRequestVote,
        FeatureRequestComment,
        Issue,
        IssueComment,
        WorkItem,
        Initiative,
        Issue,
        Milestone,
        Project,
      ]),
      ConfigModule.forRoot({
        load: [databaseConfig, encryptionConfig, jwtConfig],
      }),
      EventEmitterModule.forRoot(),
      ...imports,
    ],
    providers: [
      ConfigService,
      ...providers,
      {
        provide: 'S3_CLIENT',
        useValue: s3ClientMock,
      },
      {
        provide: 'POSTMARK_CLIENT',
        useValue: postmarkClientMock,
      },
      {
        provide: 'STRIPE_CLIENT',
        useValue: stripeClientMock,
      },
      MailNotificationsService,
      {
        provide: 'GITHUB_CLIENT',
        useValue: githubClientMock,
      },
      StripeService,
      OrgsService,
      TokensService,
      CommentsService,
    ],
  }).compile();

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return {
    module,
    cleanup: async () => await clearDatabase(dataSource),
  };
}
