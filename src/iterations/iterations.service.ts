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

  getIterationWeekNumbersForTitle(startDate: Date, endDate: Date) {
    const startWeekNumber = Math.ceil((startDate.getDate() + 6 - startDate.getDay()) / 7);
    const endWeekNumber = Math.ceil((endDate.getDate() + 6 - endDate.getDay()) / 7);
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
    iteration.title = `Iteration ${this.getIterationWeekNumbersForTitle(iteration.startDate, iteration.endDate)} ${iteration.startDate.getFullYear()}`;
    iteration.org = Promise.resolve(org);
    const savedIteration = await this.iterationRepository.save(iteration);
    return IterationMapper.toDto(savedIteration);
  }
}
