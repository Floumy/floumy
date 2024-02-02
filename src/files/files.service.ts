import { Injectable } from "@nestjs/common";
import { v4 as uuidV4 } from "uuid";
import { FilesStorageRepository } from "./files-storage.repository";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Org } from "../orgs/org.entity";
import { Repository } from "typeorm";
import { File } from "./file.entity";
import { WorkItemFile } from "../backlog/work-items/work-item-file.entity";
import { FeatureFile } from "../roadmap/features/feature-file.entity";

@Injectable()
export class FilesService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Org) private orgsRepository: Repository<Org>,
    @InjectRepository(File) private filesRepository: Repository<File>,
    @InjectRepository(WorkItemFile) private workItemFilesRepository: Repository<WorkItemFile>,
    @InjectRepository(FeatureFile) private featureFilesRepository: Repository<FeatureFile>,
    private filesStorageRepository: FilesStorageRepository) {
  }

  async uploadFile(orgId: string, file: Express.Multer.File) {
    const org = await this.orgsRepository.findOneByOrFail({ id: orgId });
    const filePath = `${orgId}/${uuidV4()}-${file.originalname}`;
    await this.filesStorageRepository.storeObject(filePath, file.buffer);
    const fileEntity = new File();
    fileEntity.org = Promise.resolve(org);
    fileEntity.name = file.originalname;
    fileEntity.path = filePath;
    fileEntity.size = file.size;
    fileEntity.type = file.mimetype;
    fileEntity.url = `${this.configService.get("fileStorage.bucketEndpoint")}/${filePath}`;
    const savedFile = await this.filesRepository.save(fileEntity);
    return { id: savedFile.id, name: savedFile.name, size: savedFile.size, type: savedFile.type };
  }

  async getFile(orgId: string, fileId: string) {
    const file = await this.filesRepository.findOneByOrFail({ id: fileId, org: { id: orgId } });
    return {
      ...file,
      object: await this.filesStorageRepository.getObject(file.path)
    };
  }

  async deleteFile(orgId: string, fileId: string) {
    const file = await this.filesRepository.findOneByOrFail({ id: fileId, org: { id: orgId } });
    await this.filesStorageRepository.deleteObject(file.path);
    await this.workItemFilesRepository.delete({ file: { id: file.id } });
    await this.featureFilesRepository.delete({ file: { id: file.id } });
    await this.filesRepository.delete(file.id);
  }
}
