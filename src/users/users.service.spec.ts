import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { setupTestingModule } from "../../test/test.utils";

describe("UsersService", () => {
  let service: UsersService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([User])],
      [UsersService]
    );
    cleanup = dbCleanup;
    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("when finding a user by email", () => {
    it("should return the user object", async () => {
      const user = await service.findOneByEmail("john");
      expect(user).toBeDefined();
    });
  });

  describe("when creating a user", () => {
    it("should return the user object", async () => {
      const user = await service.create(
        "Test User",
        "test@example.com",
        "testtesttest"
      );
      expect(user).toBeDefined();
    });
    it("should store the user object", async () => {
      const user = await service.create(
        "Test User",
        "test@example.com",
        "testtesttest"
      );
      const storedUser = await service.findOneByEmail("test@example.com");
      expect(storedUser).toEqual(user);
    });
    it("should validate the user password", async () => {
      await expect(service.create(
        "Test User",
        "test",
        ""
      )).rejects.toThrow();
    });
    it("should validate the email", async () => {
      await expect(service.create(
        "Test User",
        "",
        "test"
      )).rejects.toThrow();
    });
    it("should validate that the email is unique", async () => {
      await service.create(
        "steve",
        "steve@example.com",
        "testtesttest"
      );
      await expect(service.create(
        "steve",
        "steve@example.com",
        "test"
      )).rejects.toThrow();
    });
    it("should validate the email", async () => {
      await expect(service.create(
        "steve",
        "steveemail",
        "test"
      )).rejects.toThrow();
    });
    it("should validate that the password is not too short", async () => {
      await expect(service.create(
        "steve",
        "steve@example.com",
        "test"
      )).rejects.toThrow();
    });
    it("should validate that the name is not too short", async () => {
      await expect(service.create(
        "S",
        "test@example.com",
        "testtesttest"
      )).rejects.toThrow();
    });
    it("should store the password as a hash", async () => {
      const user = await service.create(
        "Test User",
        "test@example.com",
        "testtesttest"
      );
      expect(user.password).not.toEqual("test");
    });
    it("should create an organization for the user", async () => {
      const user = await service.create(
        "Test User",
        "test@example.com",
        "testtesttest"
      );
      expect(user.org).toBeDefined();
    });
  });
});
