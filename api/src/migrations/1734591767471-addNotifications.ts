import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1734361881711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "notification_entity_enum" AS ENUM(
        'initiative_comment',
        'initiative_description',
        'feature_request_comment',
        'issue_comment',
        'key_result_comment',
        'objective_comment',
        'work_item_comment',
        'work_item_description'
        )`);
    await queryRunner.query(`
        CREATE TYPE "notification_action_enum" AS ENUM(
        'create',
        'update',
        'delete'
        )`);
    await queryRunner.query(`
      CREATE TYPE "notification_status_enum" AS ENUM(
        'unread',
        'read'
        )`);
    await queryRunner.query(`
            CREATE TABLE "notification"
            (
                "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
                "entity"      "notification_entity_enum" NOT NULL,
                "action"      "notification_action_enum" NOT NULL,
                "status"      character varying NOT NULL,
                "createdById" uuid              NOT NULL,
                "entityId"    uuid              NOT NULL,
                "userId"      uuid              NOT NULL,
                "projectId"   uuid              NOT NULL,
                "orgId"       uuid              NOT NULL,
                "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                CONSTRAINT "PK_NOTIFICATION" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_NOTIFICATION_ENTITY_ID" ON "notification" ("entityId", "userId")`);
    await queryRunner.query(`
        ALTER TABLE "notification"
            ADD CONSTRAINT "FK_NOTIFICATION_CREATED_BY_ID" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`
    ALTER TABLE "notification"
        ADD CONSTRAINT "FK_NOTIFICATION_USER_ID" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`
    ALTER TABLE "notification"
        ADD CONSTRAINT "FK_NOTIFICATION_PROJECT_ID" FOREIGN KEY ("projectId") REFERENCES "project" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`
    ALTER TABLE "notification"
        ADD CONSTRAINT "FK_NOTIFICATION_ORG_ID" FOREIGN KEY ("orgId") REFERENCES "org" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "notification_entity_enum"`);
    await queryRunner.query(`DROP TYPE "notification_action_enum"`);
    await queryRunner.query(`DROP TYPE "notification_status_enum"`);
  }
}
