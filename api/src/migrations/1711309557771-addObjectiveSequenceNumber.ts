import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveSequenceNumber1711309557771
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE objective_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "objective"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('objective_sequence_number_seq')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "objective"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE objective_sequence_number_seq`);
  }
}
