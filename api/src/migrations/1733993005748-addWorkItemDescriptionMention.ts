import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkItemDescriptionMention1733993005748
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "work_item_description_mentions"
        (
            "workItemId" uuid NOT NULL,
            "userId" uuid NOT NULL,
            CONSTRAINT "PK_WORK_ITEM_DESCRIPTION_MENTION" PRIMARY KEY ("workItemId", "userId")
        )`);
    await queryRunner.query(`
        ALTER TABLE "work_item_description_mentions"
        ADD CONSTRAINT "FK_WORK_ITEM_DESCRIPTION_MENTION_WORK_ITEM_WORK_ITEM_ID" FOREIGN KEY ("workItemId") REFERENCES "work_item" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "work_item_description_mentions"`);
  }
}
