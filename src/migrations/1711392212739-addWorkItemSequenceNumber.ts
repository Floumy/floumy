import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkItemSequenceNumber1711392212739
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE work_item_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "work_item"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('work_item_sequence_number_seq')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "work_item"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE work_item_sequence_number_seq`);
  }
}
