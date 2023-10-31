import {Test, TestingModule} from "@nestjs/testing";
import {jwtModule} from "../../test/jwt.test-module";
import {UsersService} from './users.service';

describe("UsersService", () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                jwtModule
            ],
            providers: [UsersService]
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("when finding a user by username", () => {
        it("should return the user object", async () => {
            const user = await service.findOne("john");
            expect(user).toBeDefined();
        });
    });

    describe("when creating a user", () => {
        it("should return the user object", async () => {
            const user = await service.create(
                "test",
                "test"
            );
            expect(user).toBeDefined();
        });
        it("should store the user object", async () => {
            const user = await service.create(
                "test",
                "test"
            );
            const storedUser = await service.findOne("test");
            expect(storedUser).toEqual(user);
        });
        it("should validate the user password", async () => {
            await expect(service.create(
                "test",
                ""
            )).rejects.toThrow();
        });
        it("should validate the username", async () => {
            await expect(service.create(
                "",
                "test"
            )).rejects.toThrow();
        });
        it("should validate that the username is unique", async () => {
            await service.create(
                "steve",
                "test"
            );
            await expect(service.create(
                "steve",
                "test"
            )).rejects.toThrow();
        });
    });
});
