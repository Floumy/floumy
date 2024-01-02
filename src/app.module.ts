import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OkrsModule } from "./okrs/okrs.module";
import { OrgsModule } from "./orgs/orgs.module";
import { RoadmapModule } from "./roadmap/roadmap.module";
import { BacklogModule } from "./backlog/backlog.module";
import { IterationsModule } from "./iterations/iterations.module";
import databaseConfig from "./config/database.config";
import encryptionConfig from "./config/encryption.config";
import jwtConfig from "./config/jwt.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, encryptionConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("database.host"),
        port: +configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.name"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
        logging: false
      }),
      inject: [ConfigService],
      imports: [ConfigModule]
    }),
    AuthModule,
    UsersModule,
    OkrsModule,
    OrgsModule,
    RoadmapModule,
    BacklogModule,
    IterationsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
