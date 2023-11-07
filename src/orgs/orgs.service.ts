import { Injectable } from "@nestjs/common";
import { User } from "../users/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Org } from "./org.entity";

@Injectable()
export class OrgsService {

  constructor(@InjectRepository(Org) private orgRepository: Repository<Org>) {
  }

  async createForUser(user: User) {
    const org = new Org();
    org.users = [user];
    return await this.orgRepository.save(org);
  }

  async clear() {
    await this.orgRepository.clear();
  }
}
