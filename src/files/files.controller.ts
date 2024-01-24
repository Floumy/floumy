import {
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";
import { Response } from "express";
import { v4 as uuidV4 } from "uuid";

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
  })) file: Express.Multer.File, @Res() res: Response) {
    const filename = `${uuidV4()}-${file.originalname}`;
    res.status(201).send({ filename });
    this.filesService.uploadFile(filename, file);
  }
}
