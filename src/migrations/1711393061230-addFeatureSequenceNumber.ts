import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureSequenceNumber1711393061230
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE feature_sequence_number_seq`);
    await queryRunner.query(`ALTER TABLE "feature"
        ADD COLUMN "sequenceNumber" integer NOT NULL UNIQUE DEFAULT nextval('feature_sequence_number_seq')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "feature"
        DROP COLUMN "sequenceNumber"`);
    await queryRunner.query(`DROP SEQUENCE feature_sequence_number_seq`);
  }
}
