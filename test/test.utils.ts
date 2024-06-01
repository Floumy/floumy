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
  const module: TestingModule = await Test.createTestingModule({
    controllers,
    imports: [
      CacheModule.register(),
      jwtModule,
      typeOrmModule,
      TypeOrmModule.forFeature([User, RefreshToken]),
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
      NotificationsService,
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
