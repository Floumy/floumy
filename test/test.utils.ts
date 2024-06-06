import { Test, TestingModule } from '@nestjs/testing';
import { jwtModule } from './jwt.test-module';
import { typeOrmModule } from './typeorm.test-module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import databaseConfig from '../src/config/database.config';
import encryptionConfig from '../src/config/encryption.config';
import jwtConfig from '../src/config/jwt.config';
import { testDbOptions } from './test-db.options';
import { NotificationsService } from '../src/notifications/notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { RefreshToken } from '../src/auth/refresh-token.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { StripeService } from '../src/stripe/stripe.service';
import { OrgsService } from '../src/orgs/orgs.service';
import { PaymentsService } from '../src/payments/payments.service';
import { Org } from '../src/orgs/org.entity';
import { TokensService } from '../src/auth/tokens.service';

const dataSource = new DataSource(testDbOptions);

export async function clearDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  await dataSource.transaction(async () => {
    try {
      for (const entity of dataSource.entityMetadatas) {
        const repository = queryRunner.manager.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  });
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
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers,
    imports: [
      CacheModule.register(),
      jwtModule,
      typeOrmModule,
      TypeOrmModule.forFeature([User, RefreshToken, Org]),
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
      NotificationsService,
      StripeService,
      OrgsService,
      PaymentsService,
      TokensService,
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
