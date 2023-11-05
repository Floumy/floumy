import { Injectable } from "@nestjs/common";

@Injectable()
export class OkrsService {
  async create(param: {
    description: string;
    title: string
  }) {

  }
}
