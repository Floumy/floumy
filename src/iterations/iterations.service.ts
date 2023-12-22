import { Injectable } from "@nestjs/common";
import { CreateOrUpdateIterationDto } from "./dtos";
import { Iteration } from "./Iteration.entity";
import { Repository } from "typeorm";
import { Org } from "../orgs/org.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IterationMapper } from "./iteration.mapper";

@Injectable()
export class IterationsService {

  constructor(@InjectRepository(Iteration) private iterationRepository: Repository<Iteration>,
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
    iteration.endDate = new Date(iteration.startDate.getTime() + iteration.duration * 7 * 24 * 60 * 60 * 1000 - 1);
    iteration.title = `Iteration ${this.getIterationCalendarWeekNumbersForTitle(iteration.startDate, iteration.endDate)} ${iteration.startDate.getFullYear()}`;
    iteration.org = Promise.resolve(org);
    const savedIteration = await this.iterationRepository.save(iteration);
    return IterationMapper.toDto(savedIteration);
  }

  async list(orgId: string) {
    const iterations = await this.iterationRepository.find({
      where: {
        org: {
          id: orgId
        }
      },
      order: {
        startDate: "DESC"
      }
    });
    return iterations.map(iteration => IterationMapper.toDto(iteration));
  }
}
