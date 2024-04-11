import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBipSettingsTable1712857365907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bip_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                                    "isBuildInPublicEnabled" boolean NOT NULL DEFAULT false, 
                                    "isObjectivesPagePublic" boolean NOT NULL DEFAULT false, 
                                    "isRoadmapPagePublic" boolean NOT NULL DEFAULT false, 
                                    "isIterationsPagePublic" boolean NOT NULL DEFAULT false, 
                                    "isActiveIterationsPagePublic" boolean NOT NULL DEFAULT false, 
                                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                                    "orgId" uuid, CONSTRAINT "PK_3b3b3b3b3b3b3b3b3b3b3b3b3b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bip_settings"`);
  }
}
