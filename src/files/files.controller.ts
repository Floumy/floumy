import { Controller, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";

@Controller("files")
export class FilesController {

  constructor(private filesService: FilesService) {
  }

  @Post("/")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })
    ]
  })) file: Express.Multer.File) {
    return await this.filesService.uploadFile(file);
  }
}
