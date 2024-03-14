import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710444680044 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table work_items_status_stats
        (
            id                   uuid    default uuid_generate_v4() not null
                constraint "PK_ae42751c0c83af19e8b6b64cdb1"
                    primary key,
            planned              integer default 0                  not null,
            "readyToStart"       integer default 0                  not null,
            "inProgress"         integer default 0                  not null,
            blocked              integer default 0                  not null,
            "codeReview"         integer default 0                  not null,
            testing              integer default 0                  not null,
            revisions            integer default 0                  not null,
            "readyForDeployment" integer default 0                  not null,
            deployed             integer default 0                  not null,
            done                 integer default 0                  not null,
            closed               integer default 0                  not null
        );

        create table org
        (
            id                uuid      default uuid_generate_v4() not null
                constraint "PK_703783130f152a752cadf7aa751"
                    primary key,
            "invitationToken" varchar   default uuid_generate_v4() not null
                constraint "UQ_4422a23bf6f31401c10cef45f81"
                    unique,
            "createdAt"       timestamp default now()              not null,
            "updatedAt"       timestamp default now()              not null
        );

        create table milestone
        (
            id          uuid      default uuid_generate_v4() not null
                constraint "PK_f8372abce331f60ba7b33fe23a7"
                    primary key,
            title       varchar                              not null,
            description varchar                              not null,
            "dueDate"   timestamp                            not null,
            "createdAt" timestamp default now()              not null,
            "updatedAt" timestamp default now()              not null,
            "orgId"     uuid
                constraint "FK_95c7b7f92bffc6aef3ab11bc24c"
                    references org
        );

        create table iteration
        (
            id                uuid                  default uuid_generate_v4() not null
                constraint "PK_53b96079dea7a00e9a04e32cf10"
                    primary key,
            title             varchar                                          not null,
            goal              varchar                                          not null,
            "startDate"       timestamp                                        not null,
            "endDate"         timestamp                                        not null,
            "actualStartDate" timestamp,
            "actualEndDate"   timestamp,
            duration          integer                                          not null,
            velocity          integer,
            status            iteration_status_enum default 'planned'::iteration_status_enum not null,
            "createdAt"       timestamp             default now()              not null,
            "updatedAt"       timestamp             default now()              not null,
            "orgId"           uuid
                constraint "FK_d754818e61b9054deef939c3157"
                    references org
        );

        create table file
        (
            id                uuid      default uuid_generate_v4() not null
                constraint "PK_36b46d232307066b3a2c9ea3a1d"
                    primary key,
            name              varchar                              not null,
            type              varchar                              not null,
            size              integer                              not null,
            path              varchar                              not null,
            url               varchar                              not null,
            "createdAt"       timestamp default now()              not null,
            "updatedAt"       timestamp default now()              not null,
            "orgId"           uuid
                constraint "FK_8b1836cdfcfb69ab860ece141a4"
                    references org,
            "workItemFilesId" uuid
                constraint "REL_557098c0f80d2de3d0b4c9cb09"
                    unique
        );

        create table "user"
        (
            id                   uuid      default uuid_generate_v4() not null
                constraint "PK_cace4a159ff9f2512dd42373760"
                    primary key,
            name                 varchar                              not null,
            email                varchar                              not null,
            password             varchar                              not null,
            "createdAt"          timestamp default now()              not null,
            "updatedAt"          timestamp default now()              not null,
            "isActive"           boolean   default false              not null,
            "activationToken"    varchar,
            "passwordResetToken" varchar,
            "orgId"              uuid
                constraint "FK_4f5adb58513c2fe57eb9c79cc16"
                    references org
        );

        create table refresh_token
        (
            id               uuid      default uuid_generate_v4() not null
                constraint "PK_b575dd3c21fb0831013c909e7fe"
                    primary key,
            token            varchar                              not null,
            "expirationDate" timestamp                            not null,
            "createdAt"      timestamp default now()              not null,
            "updatedAt"      timestamp default now()              not null,
            "userId"         uuid
                constraint "FK_8e913e288156c133999341156ad"
                    references "user"
        );

        create table objective
        (
            id             uuid                  default uuid_generate_v4() not null
                constraint "PK_1084365b2a588160b31361a252e"
                    primary key,
            title          varchar                                          not null,
            progress       double precision      default '0':: double precision not null,
            status         objective_status_enum default 'on-track'::objective_status_enum not null,
            "startDate"    timestamp,
            "endDate"      timestamp,
            "createdAt"    timestamp             default now()              not null,
            "updatedAt"    timestamp             default now()              not null,
            "orgId"        uuid
                constraint "FK_237c34436598d5c2d21a926d15b"
                    references org,
            "assignedToId" uuid
                constraint "FK_1c061002849d4644a2e72432147"
                    references "user"
        );

        create table key_result
        (
            id            uuid                   default uuid_generate_v4() not null
                constraint "PK_9064c5abe9ba68432934564d43f"
                    primary key,
            title         varchar                                           not null,
            progress      double precision       default '0':: double precision not null,
            status        key_result_status_enum default 'on-track'::key_result_status_enum not null,
            "createdAt"   timestamp              default now()              not null,
            "updatedAt"   timestamp              default now()              not null,
            "orgId"       uuid
                constraint "FK_82d5f7afd8d04441470ec496334"
                    references org,
            "objectiveId" uuid
                constraint "FK_23a93a8313c2eeb141e72c30098"
                    references objective
        );

        create table feature
        (
            id               uuid                  default uuid_generate_v4() not null
                constraint "PK_03930932f909ca4be8e33d16a2d"
                    primary key,
            title            varchar                                          not null,
            description      varchar,
            priority         feature_priority_enum default 'medium'::feature_priority_enum not null,
            status           feature_status_enum   default 'planned'::feature_status_enum not null,
            progress         double precision      default '0':: double precision not null,
            "workItemsCount" integer               default 0                  not null,
            "createdAt"      timestamp             default now()              not null,
            "updatedAt"      timestamp             default now()              not null,
            "orgId"          uuid
                constraint "FK_ac96cf75cb6ed0a12aff7bbd6cd"
                    references org,
            "createdById"    uuid
                constraint "FK_3e606ed14723e33f45ec6dd0ccb"
                    references "user",
            "assignedToId"   uuid
                constraint "FK_100c5f8ce0e33826905fa1af6c3"
                    references "user",
            "keyResultId"    uuid
                constraint "FK_25ae82962a501b7c92715a7a85f"
                    references key_result,
            "milestoneId"    uuid
                constraint "FK_93db3b3189de5600d66529f8acd"
                    references milestone
        );

        create table work_item
        (
            id                       uuid                    default uuid_generate_v4() not null
                constraint "PK_ef6a53d98d3a483417ae3334144"
                    primary key,
            title                    varchar                                            not null,
            description              varchar                                            not null,
            type                     work_item_type_enum     default 'user-story'::work_item_type_enum not null,
            priority                 work_item_priority_enum default 'medium'::work_item_priority_enum not null,
            status                   work_item_status_enum   default 'planned'::work_item_status_enum not null,
            estimation               integer,
            "completedAt"            timestamp,
            "createdAt"              timestamp               default now()              not null,
            "updatedAt"              timestamp               default now()              not null,
            "createdById"            uuid
                constraint "FK_7e4a984a90e9bc406724bc7a922"
                    references "user",
            "assignedToId"           uuid
                constraint "FK_6a987cb4618c308642485461a4f"
                    references "user",
            "orgId"                  uuid
                constraint "FK_f11fcf6408a08bfdcb668961df4"
                    references org,
            "featureId"              uuid
                constraint "FK_be33b060051a05611c0942ad4a9"
                    references feature,
            "iterationId"            uuid
                constraint "FK_45e5504e0db9a7699ef99e4c669"
                    references iteration,
            "workItemsStatusStatsId" uuid
                constraint "REL_67ce5c2c03aa798ab8a6165d12"
                    unique
                constraint "FK_67ce5c2c03aa798ab8a6165d12d"
                    references work_items_status_stats
        );

        create table work_item_file
        (
            id           uuid default uuid_generate_v4() not null
                constraint "PK_6b6427a9fb8277e20674ef6d5e3"
                    primary key,
            "workItemId" uuid
                constraint "FK_6489a8835c1af9c6ecf80035bf0"
                    references work_item,
            "fileId"     uuid
                constraint "REL_b91cb98aeb6d547729d07fafd2"
                    unique
                constraint "FK_b91cb98aeb6d547729d07fafd2c"
                    references file
        );

        DO
        $$
        BEGIN
    -- Check if the constraint does not exist
    IF
        NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'file' AND constraint_name = 'FK_557098c0f80d2de3d0b4c9cb092'
    ) THEN
        -- Add the constraint if it does not exist
        ALTER TABLE file
            ADD CONSTRAINT "FK_557098c0f80d2de3d0b4c9cb092"
                FOREIGN KEY ("workItemFilesId") REFERENCES work_item_file;
        END IF;
        END $$;

        create table feature_file
        (
            id          uuid default uuid_generate_v4() not null
                constraint "PK_72cd1dbab7f55b7b3d188e7d4ee"
                    primary key,
            "featureId" uuid
                constraint "FK_0136df73fadbc51a9890652a269"
                    references feature,
            "fileId"    uuid
                constraint "REL_6d850d597e4806d21a717d0c07"
                    unique
                constraint "FK_6d850d597e4806d21a717d0c07c"
                    references file
        );
        create table work_items_status_log
        (
            id           uuid default uuid_generate_v4() not null
                constraint "PK_a46b90bef71b14f8b7a19aefaf5"
                    primary key,
            "workItemId" varchar                         not null,
            status       varchar                         not null,
            timestamp    timestamp                       not null
        );
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
