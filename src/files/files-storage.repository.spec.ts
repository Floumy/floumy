import { FilesStorageRepository } from "./files-storage.repository";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { BacklogModule } from "../backlog/backlog.module";
import { FilesService } from "./files.service";
import { WorkItemsController } from "../backlog/work-items/work-items.controller";
import { FilesController } from "./files.controller";
import { OrgsService } from "../orgs/orgs.service";
import { UsersService } from "../users/users.service";
import { File } from "./file.entity";
import { WorkItemFile } from "../backlog/work-items/work-item-file.entity";

describe("FilesStorageRepository", () => {
  let service: FilesStorageRepository;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, File, WorkItemFile]), UsersModule, AuthModule, BacklogModule],
      [FilesService, FilesStorageRepository],
      [WorkItemsController, FilesController]
    );
    cleanup = dbCleanup;

    service = module.get<FilesStorageRepository>(FilesStorageRepository);
    const orgsService = module.get<OrgsService>(OrgsService);
    const usersService = module.get<UsersService>(UsersService);
    const user = await usersService.create(
      "Test User",
      "test@example.com",
      "testtesttest"
    );
    org = await orgsService.createForUser(user);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
