import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OkrsModule } from "./okrs/okrs.module";
import { OrgsModule } from "./orgs/orgs.module";
import { RoadmapModule } from "./roadmap/roadmap.module";
import { BacklogModule } from "./backlog/backlog.module";
import { IterationsModule } from "./iterations/iterations.module";
import { FilesModule } from "./files/files.module";
import { NotificationsModule } from "./notifications/notifications.module";
import databaseConfig from "./config/database.config";
import encryptionConfig from "./config/encryption.config";
import jwtConfig from "./config/jwt.config";
import fileStorageConfig from "./config/file-storage.config";
import emailConfig from "./config/mail.config";
import appConfig from "./config/app.config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { CacheModule } from "@nestjs/cache-manager";
import { BipModule } from "./bip/bip.module";
import { StripeModule } from "./stripe/stripe.module";

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      load: [
        databaseConfig,
        encryptionConfig,
        jwtConfig,
        fileStorageConfig,
        emailConfig,
        appConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        let settings: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get('database.host'),
          port: +configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: true,
          synchronize: false,
          logging: false,
        };

        if (configService.get('database.ssl')) {
          settings = {
            ...settings,
            ssl: {
              rejectUnauthorized: true,
              ca: configService.get('database.sslCertificate'),
            },
          };
        }

        return settings;
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    OkrsModule,
    OrgsModule,
    RoadmapModule,
    BacklogModule,
    IterationsModule,
    FilesModule,
    NotificationsModule,
    BipModule,
    StripeModule
  ],
  providers: [AppService],
})
export class AppModule {}
