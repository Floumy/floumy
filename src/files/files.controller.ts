import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AuthGuard } from '../auth/auth.guard';
import { Readable } from 'stream';

@Controller('/orgs/:orgId/products/:productId/files')
@UseGuards(AuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      return await this.filesService.uploadFile(orgId, productId, file);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('/:id')
  @Header('Access-Control-Expose-Headers', 'Content-Disposition')
  async getFile(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('id') fileId: string,
    @Request() request,
    @Response() response,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    try {
      const file = await this.filesService.getFile(orgId, productId, fileId);
      response.setHeader('Content-Type', file.object.ContentType);
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.name}"`,
      );
      if (file.object.Body instanceof Buffer) {
        response.end(file.object.Body);
      } else if (file.object.Body instanceof Readable) {
        file.object.Body.pipe(response);
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Delete('/:id')
  async deleteFile(
    @Param('orgId') orgId: string,
    @Param('productId') productId: string,
    @Param('id') fileId: string,
    @Request() request,
  ) {
    if (orgId !== request.user.org) {
      throw new UnauthorizedException();
    }

    await this.filesService.deleteFile(orgId, productId, fileId);
  }
}
