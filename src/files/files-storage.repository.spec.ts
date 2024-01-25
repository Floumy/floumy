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

describe("FilesStorageRepository", () => {
  let service: FilesStorageRepository;
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
