import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddManyUsersToManyProducts1729104740815
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the join table for product and user
    await queryRunner.createTable(
      new Table({
        name: 'product_user',
        columns: [
          {
            name: 'productId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
    );

    // Create foreign key from product_user to product
    await queryRunner.createForeignKey(
      'product_user',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create foreign key from product_user to user
    await queryRunner.createForeignKey(
      'product_user',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Populate the new join table based on existing data
    await queryRunner.query(`
        INSERT INTO "product_user" ("productId", "userId")
        SELECT DISTINCT "productId", "id" as "userId"
        FROM "user"
        WHERE "productId" IS NOT NULL
    `);

    // Drop the existing foreign key for the productId column in the user table
    await queryRunner.query(`ALTER TABLE "user"
        DROP CONSTRAINT "FK_user_productId"`);

    // Remove the productId column from the user table
    await queryRunner.query(`ALTER TABLE "user"
        DROP COLUMN "productId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the productId column back to the user table
    await queryRunner.query(`
        ALTER TABLE "user"
            ADD "productId" uuid
    `);

    // Restore foreign key constraint for productId in user table
    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_user_productId',
      }),
    );

    // Optionally: Restore the original productId values
    await queryRunner.query(`
        UPDATE "user"
        SET "productId" = (SELECT "productId"
                           FROM "product_user"
                           WHERE "product_user"."userId" = "user"."id"
                           LIMIT 1)
        WHERE "user"."productId" IS NULL
    `);

    // Drop the product_user table
    await queryRunner.dropTable('product_user');
  }
}
