import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationService } from './notification.service';

@Controller('/orgs/:orgId/projects/:projectId/notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async listNotifications(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.notificationService.listNotifications(
        request.user.sub,
        orgId,
        projectId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('unread')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async countUnreadNotifications(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.notificationService.countUnreadNotifications(
        request.user.sub,
        orgId,
        projectId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch('mark-as-read')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async markAsRead(
    @Request() request,
    @Body('notificationIds') notificationIds: string[],
  ) {
    try {
      return await this.notificationService.markAsRead(
        request.user.sub,
        notificationIds,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteNotification(
    @Request() request,
    @Param('notificationId') notificationId: string,
  ) {
    try {
      return await this.notificationService.deleteNotification(
        request.user.sub,
        notificationId,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteAllNotifications(
    @Request() request,
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
  ) {
    await this.notificationService.deleteAllNotifications(
      request.user.sub,
      orgId,
      projectId,
    );
  }
}
