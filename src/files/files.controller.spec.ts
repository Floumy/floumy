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
import { File } from "./file.entity";

describe("FilesController", () => {
  let controller: FilesController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const mockS3Client = {
      send: jest.fn().mockImplementation(() => ({
        $metadata: {
          httpStatusCode: 200
        },
        Location: "https://test-bucket.nyc3.digitaloceanspaces.com"
      }))
    };

    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, File]), UsersModule, AuthModule, BacklogModule],
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

  describe("uploadFile", () => {
    it("should upload a file", async () => {
      const file = {
        originalname: "test.txt",
        size: 4,
        mimetype: "text/plain",
        buffer: Buffer.from("test")
      };
      const result = await controller.uploadFile(file as any, { user: { org: org.id } });
      expect(result.id).toBeDefined();
      expect(result.name).toEqual("test.txt");
      expect(result.size).toEqual(4);
      expect(result.type).toEqual("text/plain");
    });
  });
});
