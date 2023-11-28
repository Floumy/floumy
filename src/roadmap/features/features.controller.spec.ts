import { FeaturesController } from "./features.controller";
import { OrgsService } from "../../orgs/orgs.service";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Org } from "../../orgs/org.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { OkrsService } from "../../okrs/okrs.service";
import { TokensService } from "../../auth/tokens.service";
import { Feature } from "./feature.entity";
import { Objective } from "../../okrs/objective.entity";
import { Priority } from "../../common/priority.enum";
import { Timeline } from "../../common/timeline.enum";
import { FeaturesService } from "./features.service";
import { UsersService } from "../../users/users.service";
import { UsersModule } from "../../users/users.module";

describe("FeaturesController", () => {
  let controller: FeaturesController;
  let cleanup: () => Promise<void>;
  let org: Org;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Org, Objective, KeyResult, Feature]), UsersModule],
      [OkrsService, OrgsService, TokensService, FeaturesService],
      [FeaturesController]
    );
    cleanup = dbCleanup;
    controller = module.get<FeaturesController>(FeaturesController);
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

  describe("when creating a feature", () => {
    it("should return 201", async () => {
      const okrResponse = await controller.create(
        {
          user: {
            org: org.id
          }
        },
        {
          title: "my feature",
          description: "my feature description",
          timeline: Timeline.THIS_QUARTER,
          priority: Priority.HIGH
        });
      expect(okrResponse.title).toEqual("my feature");
      expect(okrResponse.description).toEqual("my feature description");
      expect(okrResponse.timeline).toEqual(Timeline.THIS_QUARTER);
      expect(okrResponse.priority).toEqual(Priority.HIGH);
    });
    it("should return 400 if title is missing", async () => {
      try {
        await controller.create(
          {
            user: {
              org: org.id
            }
          },
          {
            title: null,
            description: "my feature description",
            timeline: Timeline.THIS_QUARTER,
            priority: Priority.HIGH
          });
      } catch (e) {
        expect(e.message).toEqual("Bad Request");
      }
    });
  });
});
