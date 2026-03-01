import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToPage1760000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "page"
      ADD COLUMN "slug" VARCHAR NOT NULL DEFAULT 'untitled'
    `);

    await queryRunner.query(`
      UPDATE "page"
      SET "slug" = COALESCE(
        NULLIF(
          TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(COALESCE("title", 'untitled')), '[^a-z0-9]+', '-', 'g')),
          ''
        ),
        'untitled'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "page"
      DROP COLUMN "slug"
    `);
  }
}
