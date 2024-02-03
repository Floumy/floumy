import { MilestonesService } from "./milestones.service";
import { UsersService } from "../../users/users.service";
import { OrgsService } from "../../orgs/orgs.service";
import { Org } from "../../orgs/org.entity";
import { setupTestingModule } from "../../../test/test.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Objective } from "../../okrs/objective.entity";
import { KeyResult } from "../../okrs/key-result.entity";
import { User } from "../../users/user.entity";
import { Milestone } from "./milestone.entity";
import { FeaturesService } from "../features/features.service";
import { Feature } from "../features/feature.entity";
import { Priority } from "../../common/priority.enum";
import { OkrsService } from "../../okrs/okrs.service";
import { BacklogModule } from "../../backlog/backlog.module";
import { FeatureStatus } from "../features/featurestatus.enum";
import { File } from "../../files/file.entity";
import { FeatureFile } from "../features/feature-file.entity";

describe("MilestonesService", () => {
  let usersService: UsersService;
  let service: MilestonesService;
  let orgsService: OrgsService;
  let featuresService: FeaturesService;

  let org: Org;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [TypeOrmModule.forFeature([Objective, Org, KeyResult, Milestone, Feature, User, Objective, KeyResult, File, FeatureFile]), BacklogModule],
      [OrgsService, MilestonesService, UsersService, FeaturesService, OkrsService]
    );
    cleanup = dbCleanup;
    service = module.get<MilestonesService>(MilestonesService);
    usersService = module.get<UsersService>(UsersService);
    orgsService = module.get<OrgsService>(OrgsService);
    featuresService = module.get<FeaturesService>(FeaturesService);
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

  describe("when creating a milestone", () => {
    it("should return a milestone", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      expect(milestone.id).toBeDefined();
      expect(milestone.title).toEqual("my milestone");
      expect(milestone.description).toEqual("my milestone");
      expect(milestone.dueDate).toEqual("2020-01-01");
    });
    it("should throw an error if title is missing", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "",
          description: "my milestone",
          dueDate: "2020-01-01"
        })
      ).rejects.toThrow("Milestone title is required");
    });
    it("should throw an error if dueDate is missing", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "my milestone",
          description: "my milestone",
          dueDate: ""
        })
      ).rejects.toThrow("Milestone due date is required");
    });
    it("should throw an error if dueDate is invalid", async () => {
      await expect(
        service.createMilestone(org.id, {
          title: "my milestone",
          description: "my milestone",
          dueDate: "2020-01"
        })
      ).rejects.toThrow("Invalid due date");
    });
  });
  describe("when listing milestones", () => {
    it("should return the milestones", async () => {
      await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      const milestones = await service.listMilestones(org.id);
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual("my milestone");
      expect(milestones[0].dueDate).toEqual("2020-01-01");
    });
  });
  describe("when listing milestones with features", () => {
    it("should return the milestones", async () => {
      await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      const milestones = await service.listMilestonesWithFeatures(org.id);
      expect(milestones.length).toEqual(1);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual("my milestone");
      expect(milestones[0].dueDate).toEqual("2020-01-01");
      expect(milestones[0].features.length).toEqual(0);
      expect(milestones[0].timeline).toEqual("past");
    });
    it("should return the milestones with features", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      await service.createMilestone(org.id, {
        title: "my milestone 2",
        description: "my milestone 2",
        dueDate: "2020-01-01"
      });
      await featuresService.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED
      });
      const milestones = await service.listMilestonesWithFeatures(org.id);
      expect(milestones.length).toEqual(2);
      expect(milestones[0].id).toBeDefined();
      expect(milestones[0].title).toEqual("my milestone");
      expect(milestones[0].dueDate).toEqual("2020-01-01");
      expect(milestones[0].features.length).toEqual(1);
      expect(milestones[0].features[0].id).toBeDefined();
      expect(milestones[0].features[0].title).toEqual("my feature");
      expect(milestones[0].features[0].priority).toEqual(Priority.HIGH.valueOf());
      expect(milestones[0].features[0].createdAt).toBeDefined();
      expect(milestones[0].features[0].updatedAt).toBeDefined();
      expect(milestones[1].id).toBeDefined();
      expect(milestones[1].title).toEqual("my milestone 2");
      expect(milestones[1].dueDate).toEqual("2020-01-01");
      expect(milestones[1].features.length).toEqual(0);
    });
  });
  describe("when getting a milestone", () => {
    it("should return the milestone", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      const foundMilestone = await service.get(org.id, milestone.id);
      expect(foundMilestone.id).toEqual(milestone.id);
      expect(foundMilestone.title).toEqual(milestone.title);
      expect(foundMilestone.description).toEqual(milestone.description);
      expect(foundMilestone.timeline).toEqual("past");
      expect(foundMilestone.dueDate).toEqual(milestone.dueDate);
    });
  });
  describe("when updating a milestone", () => {
    it("should return the milestone", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      const updatedMilestone = await service.update(org.id, milestone.id, {
        title: "my milestone updated",
        description: "my milestone updated",
        dueDate: "2020-01-02"
      });
      expect(updatedMilestone.id).toEqual(milestone.id);
      expect(updatedMilestone.title).toEqual("my milestone updated");
      expect(updatedMilestone.description).toEqual("my milestone updated");
      expect(updatedMilestone.dueDate).toEqual("2020-01-02");
    });
  });
  describe("when deleting a milestone", () => {
    it("should delete the milestone", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      await service.delete(org.id, milestone.id);
      await expect(service.get(org.id, milestone.id)).rejects.toThrow();
    });
    it("should not delete the features but remove the milestone reference", async () => {
      const milestone = await service.createMilestone(org.id, {
        title: "my milestone",
        description: "my milestone",
        dueDate: "2020-01-01"
      });
      const feature = await featuresService.createFeature(org.id, {
        title: "my feature",
        description: "my feature description",
        priority: Priority.HIGH,
        milestone: milestone.id,
        status: FeatureStatus.PLANNED
      });
      await service.delete(org.id, milestone.id);
      const foundFeature = await featuresService.getFeature(org.id, feature.id);
      expect(foundFeature.milestone).toBeUndefined();
    });
  });
});
