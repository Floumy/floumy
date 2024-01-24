import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidV4 } from "uuid";

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File) {
    const filename = `${uuidV4()}-${file.originalname}`;
    const s3Client = new S3Client({
      endpoint: "https://fra1.digitaloceanspaces.com",
      forcePathStyle: false,
      region: "fra1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
      credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET
      }
    });
    await s3Client.send(new PutObjectCommand({
      Bucket: "work-items-attachments",
      Key: filename,
      Body: file.buffer,
      ACL: "public-read"
    }));
    return { filename };
  }
}
