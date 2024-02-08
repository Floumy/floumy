import { Controller, Get, HttpCode, HttpException, HttpStatus, Request, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) {
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Request() req: any) {
    try {
      return await this.usersService.findOne(req.user.sub);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }
}
