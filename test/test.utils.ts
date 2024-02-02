import { Test, TestingModule } from "@nestjs/testing";
import { jwtModule } from "./jwt.test-module";
import { typeOrmModule } from "./typeorm.test-module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import databaseConfig from "../src/config/database.config";
import encryptionConfig from "../src/config/encryption.config";
import jwtConfig from "../src/config/jwt.config";
import { testDbOptions } from "./test-db.options";


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
  controllers: any[] = []
) {
  const mockS3Client = {
    send: jest.fn().mockImplementation(() => ({
      $metadata: {
        httpStatusCode: 200
      },
      Location: "https://test-bucket.nyc3.digitaloceanspaces.com"
    }))
  };
  const module: TestingModule = await Test.createTestingModule({
    controllers,
    imports: [
      jwtModule,
      typeOrmModule,
      ConfigModule.forRoot({
        load: [databaseConfig, encryptionConfig, jwtConfig]
      }),
      ...imports
    ],
    providers: [ConfigService, {
      provide: "S3_CLIENT",
      useValue: mockS3Client
    }, ...providers]
  }).compile();

  const dataSource = new DataSource(testDbOptions);

  await dataSource.initialize();

  return {
    module,
    cleanup: async () => await clearDatabase(dataSource)
  };
}
