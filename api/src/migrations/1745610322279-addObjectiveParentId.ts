import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveParentId1745610322279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "objective"
          ADD COLUMN "parentObjectiveId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective"
          ADD CONSTRAINT "FK_objective_parent_objective"
              FOREIGN KEY ("parentObjectiveId")
                  REFERENCES "objective" ("id")
                  ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "objective" DROP CONSTRAINT FK_objective_parent_objective`,
    );
    await queryRunner.query(
      `ALTER TABLE "objective" DROP COLUMN "parentObjectiveID"`,
    );
  }
}
