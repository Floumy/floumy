import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameIterationToSprint1738352055061
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create type sprint_status_enum as enum ('planned', 'active', 'completed');`,
    );
    await queryRunner.query(`
            ALTER TABLE iteration
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE sprint_status_enum USING status::text::sprint_status_enum,
                ALTER COLUMN status SET DEFAULT 'planned'::sprint_status_enum,
                ALTER COLUMN status SET NOT NULL;
        `);
    await queryRunner.query(`drop type iteration_status_enum;`);
    await queryRunner.query(`
            ALTER TABLE iteration
                RENAME TO sprint;
        `);
    await queryRunner.query(`
          ALTER TABLE work_item
              RENAME COLUMN "iterationId" TO "sprintId";
      `);
    await queryRunner.query(`
        ALTER TABLE bip_settings
            RENAME COLUMN "isIterationsPagePublic" TO "isSprintsPagePublic";
        `);
    await queryRunner.query(`
        ALTER TABLE bip_settings
            RENAME COLUMN "isActiveIterationsPagePublic" TO "isActiveSprintsPagePublic";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
