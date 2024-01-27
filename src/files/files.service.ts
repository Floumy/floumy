import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";
import { FilesStorageRepository } from "./files-storage.repository";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { Repository } from "typeorm";
import { File } from "./file.entity";

@Injectable()
export class FilesService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    @InjectRepository(File) private filesRepository: Repository<File>,
    private filesStorageRepository: FilesStorageRepository) {
  }

  async uploadFile(orgId: string, file: Express.Multer.File) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const objectKey = `${orgId}/${uuidV4()}-${file.originalname}`;
    await this.filesStorageRepository.storeObject(objectKey, file.buffer);
    const fileEntity = new File();
    fileEntity.org = Promise.resolve(org);
    fileEntity.name = file.originalname;
    fileEntity.path = objectKey;
    fileEntity.size = file.size;
    fileEntity.type = file.mimetype;
    fileEntity.url = `${this.configService.get("fileStorage.bucketEndpoint")}/${objectKey}`;
    const savedFile = await this.filesRepository.save(fileEntity);
    return { id: savedFile.id, name: savedFile.name, size: savedFile.size, type: savedFile.type };
  }
}
