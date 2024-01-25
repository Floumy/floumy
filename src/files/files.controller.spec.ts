import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { FilesStorageRepository } from "./files-storage.repository";
import { UsersModule } from "../users/users.module";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { OrgsService } from "../orgs/orgs.service";
import { WorkItemsController } from "../backlog/work-items/work-items.controller";
import { UsersService } from "../users/users.service";
import { AuthModule } from "../auth/auth.module";
import { BacklogModule } from "../backlog/backlog.module";

describe("FilesController", () => {
  let controller: FilesController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const mockS3Client = {
      send: jest.fn()
    };

    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org]), UsersModule, AuthModule, BacklogModule],
      [FilesService, FilesStorageRepository, {
        provide: "S3_CLIENT",
        useValue: mockS3Client
      }],
      [WorkItemsController, FilesController]
    );
    cleanup = dbCleanup;

    controller = module.get<FilesController>(FilesController);
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
    expect(controller).toBeDefined();
  });
});
