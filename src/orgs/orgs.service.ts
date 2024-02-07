import { Injectable } from "@nestjs/common";
import { User } from "../users/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Org } from "./org.entity";
import { OrgsMapper } from "./orgs.mapper";

@Injectable()
export class OrgsService {

  constructor(@InjectRepository(Org) private orgRepository: Repository<Org>) {
  }

  async createForUser(user: User) {
    const org = new Org();
    org.users = Promise.resolve([user]);
    return await this.orgRepository.save(org);
  }

  async clear() {
    await this.orgRepository.clear();
  }

  findOneById(orgId: string) {
    return this.orgRepository.findOneByOrFail({ id: orgId });
  }

  async getOrg(orgId: string) {
    const org = await this.findOneById(orgId);
    return await OrgsMapper.toOrg(org);
  }
}
