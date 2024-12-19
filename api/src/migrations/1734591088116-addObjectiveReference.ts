import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectiveReference1734591088116 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add reference column as nullable first
      ALTER TABLE objective 
      ADD COLUMN IF NOT EXISTS reference VARCHAR;

      -- Create reference generation function
      CREATE OR REPLACE FUNCTION generate_objective_reference()
      RETURNS TRIGGER AS $$
      DECLARE
          counter_value INTEGER;
      BEGIN
          WITH upsert AS (
              INSERT INTO counter ("orgId", type, value)
              VALUES (NEW."orgId", 'objective', 1)
              ON CONFLICT ("orgId", type)
              DO UPDATE SET value = counter.value + 1
              RETURNING value
          )
          SELECT value INTO counter_value FROM upsert;

          NEW.reference := 'O-' || counter_value::text;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Initialize references for existing records
      DO $$
      DECLARE
          objective_record RECORD;
      BEGIN
          FOR objective_record IN SELECT id, "orgId" FROM objective WHERE reference IS NULL LOOP
              WITH upsert AS (
                  INSERT INTO counter ("orgId", type, value)
                  VALUES (objective_record."orgId", 'objective', 1)
                  ON CONFLICT ("orgId", type)
                  DO UPDATE SET value = counter.value + 1
                  RETURNING value
              )
              UPDATE objective 
              SET reference = 'O-' || (SELECT value FROM upsert)
              WHERE id = objective_record.id;
          END LOOP;
      END $$;

      -- Make reference NOT NULL after initialization
      ALTER TABLE objective 
      ALTER COLUMN reference SET NOT NULL;

      -- Add unique constraint
      ALTER TABLE objective
      ADD CONSTRAINT objective_reference_org_unique UNIQUE (reference, "orgId");

      -- Create trigger
      CREATE TRIGGER set_objective_reference
          BEFORE INSERT ON objective
          FOR EACH ROW
          EXECUTE FUNCTION generate_objective_reference();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_objective_reference ON objective;
      DROP FUNCTION IF EXISTS generate_objective_reference();
      ALTER TABLE objective DROP CONSTRAINT IF EXISTS objective_reference_org_unique;
      ALTER TABLE objective DROP COLUMN IF EXISTS reference;
    `);
  }
}
