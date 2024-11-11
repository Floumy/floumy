import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropWorkItemFilesIdColumnFromFilesTable1710481269633
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`alter table file
        drop column "workItemFilesId";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`alter table file
        add "workItemFilesId" uuid`);
  }
}
