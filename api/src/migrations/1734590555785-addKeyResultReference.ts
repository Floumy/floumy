import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyResultReference1734590555785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add reference column as nullable first
      ALTER TABLE key_result 
      ADD COLUMN IF NOT EXISTS reference VARCHAR;

      -- Create reference generation function
      CREATE OR REPLACE FUNCTION generate_key_result_reference()
      RETURNS TRIGGER AS $$
      DECLARE
          counter_value INTEGER;
      BEGIN
          WITH upsert AS (
              INSERT INTO counter ("orgId", type, value)
              VALUES (NEW."orgId", 'key_result', 1)
              ON CONFLICT ("orgId", type)
              DO UPDATE SET value = counter.value + 1
              RETURNING value
          )
          SELECT value INTO counter_value FROM upsert;

          NEW.reference := 'KR-' || counter_value::text;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Initialize references for existing records
      DO $$
      DECLARE
          key_result_record RECORD;
      BEGIN
          FOR key_result_record IN SELECT id, "orgId" FROM key_result WHERE reference IS NULL LOOP
              WITH upsert AS (
                  INSERT INTO counter ("orgId", type, value)
                  VALUES (key_result_record."orgId", 'key_result', 1)
                  ON CONFLICT ("orgId", type)
                  DO UPDATE SET value = counter.value + 1
                  RETURNING value
              )
              UPDATE key_result 
              SET reference = 'KR-' || (SELECT value FROM upsert)
              WHERE id = key_result_record.id;
          END LOOP;
      END $$;

      -- Make reference NOT NULL after initialization
      ALTER TABLE key_result 
      ALTER COLUMN reference SET NOT NULL;

      -- Add unique constraint
      ALTER TABLE key_result
      ADD CONSTRAINT key_result_reference_org_unique UNIQUE (reference, "orgId");

      -- Create trigger
      CREATE TRIGGER set_key_result_reference
          BEFORE INSERT ON key_result
          FOR EACH ROW
          EXECUTE FUNCTION generate_key_result_reference();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_key_result_reference ON key_result;
      DROP FUNCTION IF EXISTS generate_key_result_reference();
      ALTER TABLE key_result DROP CONSTRAINT IF EXISTS key_result_reference_org_unique;
      ALTER TABLE key_result DROP COLUMN IF EXISTS reference;
    `);
  }
}
