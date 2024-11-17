import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIterationsIndexes1710621882019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes to the iteration table for the org, status, startDate, and endDate columns
    await queryRunner.query(
      `CREATE INDEX "IDX_iteration_org" ON "iteration" ("orgId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_iteration_startDate" ON "iteration" ("startDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_iteration_endDate" ON "iteration" ("endDate") `,
    );
    // Add composite index for the orgId, startDate and endDate columns
    await queryRunner.query(
      `CREATE INDEX "IDX_iteration_org_startDate_endDate" ON "iteration" ("orgId", "startDate", "endDate") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the indexes from the iteration table
    await queryRunner.query(`DROP INDEX "IDX_iteration_org"`);
    await queryRunner.query(`DROP INDEX "IDX_iteration_startDate"`);
    await queryRunner.query(`DROP INDEX "IDX_iteration_endDate"`);
    await queryRunner.query(`DROP INDEX "IDX_iteration_org_startDate_endDate"`);
  }
}
