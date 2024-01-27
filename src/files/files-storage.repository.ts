import { Inject, Injectable } from "@nestjs/common";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FilesStorageRepository {
  constructor(private configService: ConfigService,
              @Inject("S3_CLIENT") private readonly s3Client: S3Client) {
  }

  async storeObject(key: string, fileBuffer: Buffer) {
    return await this.s3Client.send(new PutObjectCommand({
      Bucket: this.configService.get("fileStorage.bucket"),
      Key: key,
      Body: fileBuffer,
      ACL: "private"
    }));
  }

  async getObject(path: string) {
    return await this.s3Client.send(new GetObjectCommand({
      Bucket: this.configService.get("fileStorage.bucket"),
      Key: path
    }));
  }
}
