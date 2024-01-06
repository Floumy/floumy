import { Injectable } from "@nestjs/common";
import { CreateOrUpdateIterationDto } from "./dtos";
import { Iteration } from "./Iteration.entity";
import { Repository } from "typeorm";
import { Org } from "../orgs/org.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IterationMapper } from "./iteration.mapper";
import { WorkItem } from "../backlog/work-items/work-item.entity";
import { IterationStatus } from "./iteration-status.enum";

@Injectable()
export class IterationsService {

  constructor(@InjectRepository(Iteration) private iterationRepository: Repository<Iteration>,
              @InjectRepository(WorkItem) private workItemsRepository: Repository<WorkItem>,
              @InjectRepository(Org) private orgRepository: Repository<Org>) {
  }

  getWeekNumber(d: Date): number {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate and return full weeks to nearest Thursday
    // @ts-ignore
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  getIterationCalendarWeekNumbersForTitle(startDate: Date, endDate: Date) {
    const startWeekNumber = this.getWeekNumber(startDate);
    const endWeekNumber = this.getWeekNumber(endDate);
    if (startWeekNumber === endWeekNumber) {
      return `CW${startWeekNumber}`;
    }

    return `CW${startWeekNumber}-CW${endWeekNumber}`;
  }

  async create(orgId: string, iterationDto: CreateOrUpdateIterationDto) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    const iteration = new Iteration();
    iteration.goal = iterationDto.goal;
    iteration.startDate = new Date(iterationDto.startDate);
    iteration.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    iteration.duration = iterationDto.duration;
    iteration.endDate = this.getIterationEndDate(iteration);
    iteration.title = this.getIterationTitle(iteration);
    iteration.org = Promise.resolve(org);
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  async list(orgId: string) {
    const iterations = await this.iterationRepository.find({
      where: {
        org: {
          id: orgId
        }
      },
      order: {
        startDate: "ASC"
      }
    });
    return await Promise.all(iterations.map(iteration => IterationMapper.toDto(iteration)));
  }

  async get(orgId: string, id: string) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId
      }
    });
    return await IterationMapper.toDto(iteration);
  }

  async update(orgId: string, id: string, updateIterationDto: CreateOrUpdateIterationDto) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId
      }
    });
    iteration.goal = updateIterationDto.goal;
    iteration.startDate = new Date(updateIterationDto.startDate);
    iteration.startDate.setUTCHours(0, 0, 0, 0);
    // Duration is in weeks
    iteration.duration = updateIterationDto.duration;
    iteration.endDate = this.getIterationEndDate(iteration);
    iteration.title = this.getIterationTitle(iteration);
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  getIterationTitle(iteration: Iteration) {
    return `Iteration ${this.getIterationCalendarWeekNumbersForTitle(iteration.startDate, iteration.endDate)} ${iteration.startDate.getFullYear()}`;
  }

  getIterationEndDate(iteration: Iteration) {
    return new Date(iteration.startDate.getTime() + iteration.duration * 7 * 24 * 60 * 60 * 1000 - 1);
  }

  async delete(orgId: string, id: string) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId
      }
    });
    await this.removeWorkItemsFromIteration(iteration);
    await this.iterationRepository.remove(iteration);
  }

  private async removeWorkItemsFromIteration(iteration: Iteration) {
    const workItems = await iteration.workItems;
    for (const workItem of workItems) {
      workItem.iteration = Promise.resolve(null);
      await this.workItemsRepository.save(workItem);
    }
  }

  async startIteration(orgId: string, id: string) {
    await this.completeActiveIterationIfExists(orgId);

    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId
      }
    });
    iteration.actualStartDate = new Date();
    iteration.status = IterationStatus.ACTIVE;
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }

  private async completeActiveIterationIfExists(orgId: string) {
    const activeIteration = await this.iterationRepository.findOneBy({
      org: {
        id: orgId
      },
      status: IterationStatus.ACTIVE
    });

    if (activeIteration) {
      activeIteration.actualEndDate = new Date();
      activeIteration.status = IterationStatus.COMPLETED;
      await this.iterationRepository.save(activeIteration);
    }
  }

  async getActiveIteration(orgId: string) {
    const iteration = await this.iterationRepository.findOneBy({
      org: {
        id: orgId
      },
      status: IterationStatus.ACTIVE
    });
    return iteration ? await IterationMapper.toDto(iteration) : null;
  }

  async completeIteration(orgId: string, id: string) {
    const iteration = await this.iterationRepository.findOneByOrFail({
      id,
      org: {
        id: orgId
      }
    });
    iteration.actualEndDate = new Date();
    iteration.status = IterationStatus.COMPLETED;
    const savedIteration = await this.iterationRepository.save(iteration);
    return await IterationMapper.toDto(savedIteration);
  }
}
