import {Test, TestingModule} from "@nestjs/testing";
import {jwtModule} from "../../test/jwt.test-module";
import {UsersService} from './users.service';
import {typeOrmModule} from '../../test/typeorm.test-module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user.entity';
import {ConfigModule} from '@nestjs/config';

describe("UsersService", () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                jwtModule,
                typeOrmModule,
                TypeOrmModule.forFeature([User]),
                ConfigModule
            ],
            providers: [UsersService]
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    afterEach(async () => {
        await service.clear();
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
                "test@example.com",
                "testtesttest"
            );
            expect(user).toBeDefined();
        });
        it("should store the user object", async () => {
            const user = await service.create(
                "test@example.com",
                "testtesttest"
            );
            const storedUser = await service.findOne("test@example.com");
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
                "steve@example.com",
                "testtesttest"
            );
            await expect(service.create(
                "steve",
                "test"
            )).rejects.toThrow();
        });
        it("should validate that the username is an email", async () => {
            await expect(service.create(
                "steve",
                "test"
            )).rejects.toThrow();
        });
        it("should validate that the password is not too short", async () => {
            await expect(service.create(
                "steve",
                "test"
            )).rejects.toThrow();
        });
        it("should store the password as a hash", async () => {
            const user = await service.create(
                "test@example.com",
                "testtesttest"
            );
            expect(user.password).not.toEqual("test");
        });
    });
});
