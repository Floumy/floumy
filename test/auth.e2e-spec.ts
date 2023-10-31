import {Test, TestingModule} from "@nestjs/testing";
import {HttpStatus, INestApplication} from "@nestjs/common";
import * as request from "supertest";
import {AuthModule} from "../src/auth/auth.module";
import {UsersModule} from "../src/users/users.module";
import {AuthService} from "../src/auth/auth.service";
import {UsersService} from "../src/users/users.service";
import {Reflector} from "@nestjs/core";
import {AppController} from "../src/app.controller";
import {AppService} from "../src/app.service";
import {AuthController} from "../src/auth/auth.controller";
import {jwtModule} from "./jwt.test-module";

describe("AuthController (e2e)", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                UsersModule,
                jwtModule
            ],
            controllers: [AppController, AuthController],
            providers: [AppService, AuthService, UsersService, Reflector]
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    async function signIn(): Promise<request.Test> {
        return request(app.getHttpServer())
            .post("/auth/sign-in")
            .send({
                username: "john",
                password: "changeme"
            })
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body.accessToken).toBeDefined();
            });
    }

    it("/ (GET)", () => {
        return request(app.getHttpServer())
            .get("/")
            .expect(HttpStatus.OK)
            .expect("Hello World!");
    });

    it("/auth/profile (GET)", () => {
        return request(app.getHttpServer())
            .get("/auth/profile")
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it("/auth/profile (GET) with token", async () => {
        // Given an access token
        const signInResponse = await signIn();

        return request(app.getHttpServer())
            .get("/auth/profile")
            .set("Authorization", `Bearer ${signInResponse.body.accessToken}`)
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body.username).toBe("john");
            });
    });

    it("/auth/profile (GET) with invalid token", async () => {
        return request(app.getHttpServer())
            .get("/auth/profile")
            .set("Authorization", `Bearer invalid`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it("/auth/sign-in (POST)", () => {
        return request(app.getHttpServer())
            .post("/auth/sign-in")
            .send({
                username: "john",
                password: "changeme"
            })
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body.accessToken).toBeDefined();
            });
    });

    it("/auth/sign-up (POST)", () => {
        return request(app.getHttpServer())
            .post("/auth/sign-up")
            .send({
                username: "test",
                password: "test"
            })
            .expect(HttpStatus.CREATED)
            .expect(({body}) => {
                expect(body.accessToken).toBeDefined();
            });
    });

    it("/auth/sign-up (POST) with invalid credentials", () => {
        return request(app.getHttpServer())
            .post("/auth/sign-up")
            .send({
                username: "",
                password: ""
            })
            .expect(HttpStatus.BAD_REQUEST);
    });
});
