import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppController } from "../src/app.controller";
import { setupTestingModule } from "./test.utils";
import { AppService } from "../src/app.service";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [AppService],
      [AppController]
    );
    cleanup = dbCleanup;
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await cleanup();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(HttpStatus.OK)
      .expect("Hello World!");
  });
});
