import { Inject, Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class FilesStorageRepository {
  constructor(@Inject("S3_CLIENT") private readonly s3Client: S3Client) {
  }

  async storeObject(key: string, fileBuffer: Buffer) {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: "work-items-attachments",
      Key: key,
      Body: fileBuffer,
      ACL: "public-read"
    }));
  }
}
