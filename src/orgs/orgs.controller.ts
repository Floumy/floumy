import { Controller, Get, HttpCode, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { OrgsService } from "./orgs.service";

@Controller("orgs")
@UseGuards(AuthGuard)
export class OrgsController {

  constructor(private orgsService: OrgsService) {
  }

  @Get("members")
  @HttpCode(200)
  async listMembers(@Request() request) {
    const org = request.user.org;
    return await this.orgsService.listMembers(org);
  }

}
