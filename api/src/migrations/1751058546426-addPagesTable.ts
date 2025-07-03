import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPageTable1751058546426 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "page"
            (
                "id"        uuid PRIMARY KEY       DEFAULT uuid_generate_v4(),
                "title"     VARCHAR                  DEFAULT NULL,
                "content"   TEXT                     DEFAULT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "parentId"  UUID                     DEFAULT NULL,
                "projectId" UUID NOT NULL,
                FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE
            )`);

    await queryRunner.query(`
            ALTER TABLE "page"
                ADD CONSTRAINT "FK_page_parent" FOREIGN KEY ("parentId") REFERENCES "page" ("id") ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "page"  
        `);
  }
}
