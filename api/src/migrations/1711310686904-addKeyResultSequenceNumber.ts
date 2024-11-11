import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyResultSequenceNumber1711310686904
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE key_result_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "key_result"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('key_result_sequence_number_seq')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "key_result"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE key_result_sequence_number_seq`);
  }
}
