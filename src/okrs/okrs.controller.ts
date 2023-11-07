import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { OkrsService } from "./okrs.service";

interface ObjectiveDto {
  objective: string;
  description: string;
}

interface OKRDto {
  objective: ObjectiveDto;
}

@Controller("okrs")
export class OkrsController {

  constructor(private okrsService: OkrsService) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() okrDto: OKRDto) {
    const objective = await this.okrsService.createObjective(
      okrDto.objective.objective,
      okrDto.objective.description
    );
    return { objective };
  }
}
