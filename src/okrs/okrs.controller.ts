import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

interface OKRDto {
  title: string;
  description: string;
}

@Controller("okrs")
export class OkrsController {

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() okrDto: OKRDto) {
    return {
      ...okrDto,
      id: "some-id"
    };
  }
}
