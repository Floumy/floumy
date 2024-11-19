import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddRelationshipBetweenEntitiesAndProducts1729018895175
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the Product table
    await queryRunner.query(`
        CREATE TABLE "product"
        (
            "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
            "name"      character varying NOT NULL,
            "orgId"     uuid,
            "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
            CONSTRAINT "PK_PRODUCT" PRIMARY KEY ("id"),
            CONSTRAINT "FK_product_orgId" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);

    // Add productId column, foreign key, and index to related tables
    const tables = [
      'user',
      'objective',
      'key_result',
      'feature',
      'milestone',
      'work_item',
      'iteration',
      'file',
      'feed_item',
      'feature_request',
      'issue',
      'bip_settings',
    ];

    for (const table of tables) {
      // Add the productId column
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'productId',
          type: 'uuid',
          isNullable: true,
        }),
      );

      // Create a foreign key for productId
      await queryRunner.createForeignKey(
        table,
        new TableForeignKey({
          columnNames: ['productId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'product',
          name: `FK_${table}_productId`,
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        }),
      );

      // Create an index for the productId column
      await queryRunner.createIndex(
        table,
        new TableIndex({
          name: `IDX_${table}_productId`,
          columnNames: ['productId'],
        }),
      );
    }

    // Insert initial Product records
    await queryRunner.query(`
        INSERT INTO "product" (id, name, "orgId")
        SELECT uuid_generate_v4(), name, id
        FROM org
    `);

    // Update related entities to set productId
    for (const table of tables) {
      await queryRunner.query(`
          UPDATE "${table}"
          SET "productId" = (SELECT id FROM "product" WHERE "orgId" = "${table}"."orgId")
      `);
    }

    for (const table of tables) {
      const result = await queryRunner.query(`SELECT *
                                              FROM "${table}"
                                              WHERE "productId" IS NULL`);
      if (result.length > 0) {
        throw new Error(
          `There are still rows in "${table}" with null productId: ${JSON.stringify(
            result,
          )}`,
        );
      }
    }

    // Remove default null values
    for (const table of tables) {
      await queryRunner.query(`
          ALTER TABLE "${table}"
              ALTER COLUMN "productId" SET NOT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'user',
      'objective',
      'key_result',
      'feature',
      'milestone',
      'work_item',
      'iteration',
      'file',
      'feed_item',
      'feature_request',
      'issue',
      'bip_settings',
    ];

    for (const table of tables) {
      // Drop the productId index
      await queryRunner.dropIndex(table, `IDX_${table}_productId`);

      // Drop the foreign key for productId
      await queryRunner.dropForeignKey(table, `FK_${table}_productId`);

      // Drop the productId column
      await queryRunner.dropColumn(table, 'productId');
    }

    // Drop the Product table
    await queryRunner.query('DROP TABLE "product"');
  }
}
