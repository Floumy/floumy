import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureReference1734555078576 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add reference column as nullable first
      ALTER TABLE feature 
      ADD COLUMN IF NOT EXISTS reference VARCHAR;

      -- Create reference generation function
      CREATE OR REPLACE FUNCTION generate_feature_reference()
      RETURNS TRIGGER AS $$
      DECLARE
          counter_value INTEGER;
      BEGIN
          WITH upsert AS (
              INSERT INTO counter ("orgId", type, value)
              VALUES (NEW."orgId", 'feature', 1)
              ON CONFLICT ("orgId", type)
              DO UPDATE SET value = counter.value + 1
              RETURNING value
          )
          SELECT value INTO counter_value FROM upsert;

          NEW.reference := 'I-' || counter_value::text;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Initialize references for existing records
      DO $$
      DECLARE
          feature_record RECORD;
      BEGIN
          FOR feature_record IN SELECT id, "orgId" FROM feature WHERE reference IS NULL LOOP
              WITH upsert AS (
                  INSERT INTO counter ("orgId", type, value)
                  VALUES (feature_record."orgId", 'feature', 1)
                  ON CONFLICT ("orgId", type)
                  DO UPDATE SET value = counter.value + 1
                  RETURNING value
              )
              UPDATE feature 
              SET reference = 'I-' || (SELECT value FROM upsert)
              WHERE id = feature_record.id;
          END LOOP;
      END $$;

      -- Make reference NOT NULL after initialization
      ALTER TABLE feature 
      ALTER COLUMN reference SET NOT NULL;

      -- Add unique constraint
      ALTER TABLE feature
      ADD CONSTRAINT feature_reference_org_unique UNIQUE (reference, "orgId");

      -- Create trigger
      CREATE TRIGGER set_feature_reference
          BEFORE INSERT ON feature
          FOR EACH ROW
          EXECUTE FUNCTION generate_feature_reference();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_feature_reference ON feature;
      DROP FUNCTION IF EXISTS generate_feature_reference();
      ALTER TABLE feature DROP CONSTRAINT IF EXISTS feature_reference_org_unique;
      ALTER TABLE feature DROP COLUMN IF EXISTS reference;
    `);
  }
}
