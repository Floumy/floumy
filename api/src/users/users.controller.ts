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
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { BasicAuthGuard } from '../auth/basic-auth.guard';
import { PatchUserDto } from './dtos';
import { Roles } from '../auth/roles.guard';
import { UserRole } from './enums';

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

  @Put(':id/role')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body() requestBody: { role: string },
  ) {
    try {
      await this.usersService.changeRole(
        req.user.sub,
        req.user.org,
        id,
        requestBody.role,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async deactivateUser(@Request() req: any, @Param('id') id: string) {
    try {
      await this.usersService.deactivate(req.user.org, id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('me/mcp-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  async getMcpToken(@Request() req: any) {
    try {
      return await this.usersService.getMcpToken(req.user.sub);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('me/mcp-token/refresh')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async refreshMcpToken(@Request() req: any) {
    try {
      return await this.usersService.refreshMcpToken(req.user.sub);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }
}
