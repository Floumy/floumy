import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { setupTestingModule } from "../../test/test.utils";
import { OrgsModule } from "../orgs/orgs.module";

describe("UsersService", () => {
  let service: UsersService;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [OrgsModule, TypeOrmModule.forFeature([User])],
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
      expect(storedUser.id).toBeDefined();
      expect(storedUser.name).toEqual(user.name);
      expect(storedUser.email).toEqual(user.email);
      expect(storedUser.password).toBeDefined();
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
      const org = await user.org;
      expect(org).toBeDefined();
      expect(org.id).toBeDefined();
    });
    it("should associate the user with the organization based on invitation token", async () => {
      const user1 = await service.create(
        "Test Org",
        "test@example.com",
        "testtesttest"
      );
      const org1 = await user1.org;
      const user2 = await service.create(
        "Test User",
        "testing@example.com",
        "testtesttest",
        org1.invitationToken
      );
      const org2 = await user2.org;
      expect(org1.id).toEqual(org2.id);
    });
  });
});
