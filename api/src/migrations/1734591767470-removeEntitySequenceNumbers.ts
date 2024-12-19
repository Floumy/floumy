import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEntitySequenceNumbers1734591767470
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "objective"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE objective_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "key_result"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE key_result_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "feature"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE feature_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "work_item"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE work_item_sequence_number_seq`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE objective_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "objective"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('objective_sequence_number_seq')`);
    await queryRunner.query(`CREATE SEQUENCE key_result_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "key_result"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('key_result_sequence_number_seq')`);
    await queryRunner.query(`CREATE SEQUENCE feature_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "feature"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('feature_sequence_number_seq')`);
    await queryRunner.query(`CREATE SEQUENCE work_item_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "work_item"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('work_item_sequence_number_seq')`);
  }
}
