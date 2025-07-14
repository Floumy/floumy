import { MigrationInterface, QueryRunner } from 'typeorm';
import { uuid } from 'uuidv4';

export class AddMcpUserToken1752439314134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN "mcpToken" varchar(255) NULL
    `);

    const users = await queryRunner.query(`SELECT id FROM "user"`);

    for (const user of users) {
      const token = uuid();
      await queryRunner.query(
        `
        UPDATE "user"
        SET "mcpToken" = $1
        WHERE "id" = $2
      `,
        [token, user.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      DROP COLUMN "mcpToken"
    `);
  }
}
