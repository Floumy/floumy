import {
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AuthGuard } from '../auth/auth.guard';
import { Readable } from 'stream';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('files')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Request() request,
  ) {
    return await this.filesService.uploadFile(request.user.org, file);
  }

  @Get('/:id')
  @Header('Access-Control-Expose-Headers', 'Content-Disposition')
  async getFile(
    @Param('id') fileId: string,
    @Request() request,
    @Response() response,
  ) {
    try {
      const file = await this.filesService.getFile(request.user.org, fileId);
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
  async deleteFile(@Param('id') fileId: string, @Request() request) {
    await this.filesService.deleteFile(request.user.org, fileId);
  }
}
