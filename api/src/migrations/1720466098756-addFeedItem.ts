import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeedItem1720466098756 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "feed_item"
        (
            "id"        uuid    NOT NULL DEFAULT uuid_generate_v4(),
            "title"     varchar NOT NULL,
            "entity"    varchar NOT NULL,
            "entityId"  varchar NOT NULL,
            "action"    varchar NOT NULL,
            "content"   varchar NOT NULL,
            "userId"    uuid             DEFAULT NULL,
            "orgId"     uuid    NOT NULL,
            "createdAt" TIMESTAMP        DEFAULT now(),
            CONSTRAINT "FK_7f2f9e1c1f0c2f7f7b2b1d1c2f2" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "FK_7f2f9e1c1f0c2f7f7b2b1d1c2f3" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
            CONSTRAINT "PK_7f2f9e1c1f0c2f7f7b2b1d1c2f2" PRIMARY KEY ("id")
        )
    `);
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
    /* eslint-enable */
}
