import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIssue1726165521055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "issue"
        (
            "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "title"       character varying NOT NULL,
            "description" character varying NOT NULL,
            "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
            "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
            "orgId"       uuid,
            "createdById" uuid,
            CONSTRAINT "PK_ISSUE" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "issue"`);
  }
}
