import { Test, TestingModule } from "@nestjs/testing";
import { jwtModule } from "./jwt.test-module";
import { typeOrmModule } from "./typeorm.test-module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import databaseConfig from "../src/config/database.config";
import encryptionConfig from "../src/config/encryption.config";
import jwtConfig from "../src/config/jwt.config";


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
    providers: [ConfigService, ...providers]
  }).compile();

  const configService = module.get(ConfigService);
  const dataSource = new DataSource({
    type: "postgres",
    host: configService.get("database.host"),
    port: +configService.get("database.port"),
    username: configService.get("database.username"),
    password: configService.get("database.password"),
    database: configService.get("database.name"),
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: true
  });

  await dataSource.initialize();

  return {
    module,
    cleanup: async () => await clearDatabase(dataSource)
  };
}
