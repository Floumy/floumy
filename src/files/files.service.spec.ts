import { FilesService } from "./files.service";
import { setupTestingModule } from "../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { BacklogModule } from "../backlog/backlog.module";
import { FilesStorageRepository } from "./files-storage.repository";
import { WorkItemsController } from "../backlog/work-items/work-items.controller";
import { FilesController } from "./files.controller";
import { OrgsService } from "../orgs/orgs.service";
import { UsersService } from "../users/users.service";
import { File } from "./file.entity";

describe("FilesService", () => {
  let service: FilesService;
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

    service = module.get<FilesService>(FilesService);
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

  describe("uploadFile", () => {
    it("should upload a file", async () => {
      const file = {
        originalname: "test.txt",
        mimetype: "text/plain",
        size: 9,
        buffer: Buffer.from("Test file")
      };
      const result = await service.uploadFile(org.id, file as any);
      expect(result).toEqual({
        id: expect.any(String),
        name: "test.txt",
        size: 9,
        type: "text/plain"
      });
    });
  });

  describe("getFile", () => {
    it("should get a file", async () => {
      const file = {
        originalname: "test.txt",
        mimetype: "text/plain",
        size: 9,
        buffer: Buffer.from("Test file")
      };
      const uploadedFile = await service.uploadFile(org.id, file as any);
      const result = await service.getFile(org.id, uploadedFile.id);
      expect(result.id).toEqual(uploadedFile.id);
      expect(result.name).toEqual("test.txt");
      expect(result.size).toEqual(9);
      expect(result.type).toEqual("text/plain");
      expect(result.object).toBeDefined();
    });
  });

  describe("deleteFile", () => {
    it("should delete a file", async () => {
      const file = {
        originalname: "test.txt",
        mimetype: "text/plain",
        size: 9,
        buffer: Buffer.from("Test file")
      };
      const uploadedFile = await service.uploadFile(org.id, file as any);
      await service.deleteFile(org.id, uploadedFile.id);
      await expect(service.getFile(org.id, uploadedFile.id)).rejects.toThrow();
    });
  });
});
