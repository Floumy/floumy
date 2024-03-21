import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesStorageRepository {
  private readonly bucket: string;

  constructor(
    private configService: ConfigService,
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
  ) {
    this.bucket = this.configService.get('fileStorage.bucket');
  }

  async storeObject(key: string, fileBuffer: Buffer) {
    return await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ACL: 'private',
      }),
    );
  }

  async getObject(path: string) {
    return await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }),
    );
  }

  async deleteObject(path: string) {
    return await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }),
    );
  }
}
