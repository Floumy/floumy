import {
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("files")
@UseGuards(AuthGuard)
export class FilesController {

  constructor(private filesService: FilesService) {
  }

  @Post("/")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile(new ParseFilePipe({
                       validators: [
                         new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })
                       ]
                     })) file: Express.Multer.File,
                   @Request() request: any) {

    return await this.filesService.uploadFile(request.user.org, file);
  }
}
