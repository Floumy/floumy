import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { FilesStorageRepository } from "./files-storage.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { S3Client } from "@aws-sdk/client-s3";

const s3ClientProvider = {
  provide: "S3_CLIENT",
  useFactory: (configService: ConfigService) => {
    return new S3Client({
      endpoint: configService.get("SPACES_ENDPOINT"),
      forcePathStyle: configService.get("SPACES_FORCE_PATH_STYLE"),
      region: configService.get("SPACES_REGION"),
      credentials: {
        accessKeyId: configService.get("SPACES_KEY"),
        secretAccessKey: configService.get("SPACES_SECRET")
      }
    });
  },
  inject: [ConfigService]
};

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesStorageRepository, s3ClientProvider],
  imports: [ConfigModule, AuthModule, UsersModule]
})
export class FilesModule {
}
