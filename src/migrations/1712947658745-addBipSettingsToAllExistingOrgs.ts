import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBipSettingsToAllExistingOrgs1712947658745
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO bip_settings ("orgId", "isBuildInPublicEnabled", "isObjectivesPagePublic", "isRoadmapPagePublic",
                                  "isIterationsPagePublic", "isActiveIterationsPagePublic")
        SELECT id, false, false, false, false, false
        FROM org
        WHERE id NOT IN (SELECT "orgId" FROM bip_settings);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE
        FROM bip_settings
        WHERE "orgId" IN (SELECT "id" FROM org WHERE "isBuildInPublicEnabled" = false);
    `);
  }
}
