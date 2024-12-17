import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkItemReference1734468133588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add reference column as nullable first
      ALTER TABLE work_item 
      ADD COLUMN IF NOT EXISTS reference VARCHAR;

      -- Create counter table
      CREATE TABLE IF NOT EXISTS counter (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "orgId" UUID NOT NULL,
          type VARCHAR NOT NULL,
          value INTEGER DEFAULT 0,
          UNIQUE("orgId", type)
      );

      -- Create reference generation function
      CREATE OR REPLACE FUNCTION generate_work_item_reference()
      RETURNS TRIGGER AS $$
      DECLARE
          counter_value INTEGER;
      BEGIN
          WITH upsert AS (
              INSERT INTO counter ("orgId", type, value)
              VALUES (NEW."orgId", 'work_item', 1)
              ON CONFLICT ("orgId", type)
              DO UPDATE SET value = counter.value + 1
              RETURNING value
          )
          SELECT value INTO counter_value FROM upsert;

          NEW.reference := 'WI-' || counter_value::text;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Initialize references for existing records
      DO $$
      DECLARE
          work_item_record RECORD;
      BEGIN
          FOR work_item_record IN SELECT id, "orgId" FROM work_item WHERE reference IS NULL LOOP
              WITH upsert AS (
                  INSERT INTO counter ("orgId", type, value)
                  VALUES (work_item_record."orgId", 'work_item', 1)
                  ON CONFLICT ("orgId", type)
                  DO UPDATE SET value = counter.value + 1
                  RETURNING value
              )
              UPDATE work_item 
              SET reference = 'WI-' || (SELECT value FROM upsert)
              WHERE id = work_item_record.id;
          END LOOP;
      END $$;

      -- Make reference NOT NULL after initialization
      ALTER TABLE work_item 
      ALTER COLUMN reference SET NOT NULL;

      -- Add unique constraint
      ALTER TABLE work_item
      ADD CONSTRAINT work_item_reference_org_unique UNIQUE (reference, "orgId");

      -- Create trigger
      CREATE TRIGGER set_work_item_reference
          BEFORE INSERT ON work_item
          FOR EACH ROW
          EXECUTE FUNCTION generate_work_item_reference();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_work_item_reference ON work_item;
      DROP FUNCTION IF EXISTS generate_work_item_reference();
      DROP TABLE IF EXISTS counter;
      ALTER TABLE work_item DROP CONSTRAINT IF EXISTS work_item_reference_org_unique;
      ALTER TABLE work_item DROP COLUMN IF EXISTS reference;
    `);
  }
}
