import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";
import { FilesStorageRepository } from "./files-storage.repository";

@Injectable()
export class FilesService {
  constructor(private filesStorageRepository: FilesStorageRepository) {
  }

  async uploadFile(orgId: string, file: Express.Multer.File) {
    const fileKey = `${orgId}/${uuidV4()}-${file.originalname}`;
    await this.filesStorageRepository.storeObject(fileKey, file.buffer);
    return { filename: fileKey };
  }
}
