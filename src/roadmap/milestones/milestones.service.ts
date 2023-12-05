import { Injectable } from "@nestjs/common";
import { CreateUpdateMilestoneDto } from "./dtos";
import { Milestone } from "./milestone.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OrgsService } from "../../orgs/orgs.service";
import { MilestoneMapper } from "./milestone.mapper";

@Injectable()
export class MilestonesService {

  constructor(
    @InjectRepository(Milestone) private milestoneRepository: Repository<Milestone>,
    private orgsService: OrgsService
  ) {
  }

  async createMilestone(orgId: string, createMilestoneDto: CreateUpdateMilestoneDto) {
    this.validateMilestone(createMilestoneDto);
    const org = await this.orgsService.findOneById(orgId);
    const milestone = new Milestone();
    milestone.title = createMilestoneDto.title;
    milestone.description = createMilestoneDto.description;
    milestone.dueDate = new Date(createMilestoneDto.dueDate);
    milestone.org = Promise.resolve(org);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return MilestoneMapper.toDto(savedMilestone);
  }

  private validateMilestone(createMilestoneDto: CreateUpdateMilestoneDto) {
    if (!createMilestoneDto.title) throw new Error("Milestone title is required");
    if (!createMilestoneDto.dueDate) throw new Error("Milestone due date is required");
    if (!createMilestoneDto.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) throw new Error("Invalid due date");
  }

  async findOneById(orgId: string, id: string) {
    return await this.milestoneRepository.findOneByOrFail({ org: { id: orgId }, id: id });
  }

  async listMilestones(orgId: string) {
    return MilestoneMapper.toListDto(await this.milestoneRepository.findBy({ org: { id: orgId } }));
  }

  async listMilestonesWithFeatures(orgId: string) {
    const milestones = await this.milestoneRepository.findBy({ org: { id: orgId } });
    return await MilestoneMapper.toListWithFeaturesDto(milestones);
  }

  async get(orgId: string, id: string) {
    const milestone = await this.milestoneRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    return MilestoneMapper.toDto(milestone);
  }

  async update(orgId: string, id: string, updateMilestoneDto: CreateUpdateMilestoneDto) {
    this.validateMilestone(updateMilestoneDto);
    const milestone = await this.milestoneRepository.findOneByOrFail({ org: { id: orgId }, id: id });
    milestone.title = updateMilestoneDto.title;
    milestone.description = updateMilestoneDto.description;
    milestone.dueDate = new Date(updateMilestoneDto.dueDate);
    const savedMilestone = await this.milestoneRepository.save(milestone);
    return MilestoneMapper.toDto(savedMilestone);
  }
}
