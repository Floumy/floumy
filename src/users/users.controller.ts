import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { BasicAuthGuard } from '../auth/basic-auth.guard';
import { PatchUserDto } from './dtos';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  async getCurrentUser(@Request() req: any) {
    try {
      return await this.usersService.findOne(req.user.sub);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch('me')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(BasicAuthGuard)
  async patchCurrentUser(
    @Request() req: any,
    @Body()
    patchUserDto: PatchUserDto,
  ) {
    try {
      return await this.usersService.patch(req.user.sub, patchUserDto);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AuthGuard)
  async deactivateUser(@Request() req: any, @Param('id') id: string) {
    try {
      await this.usersService.deactivate(req.user.org, id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }
}
