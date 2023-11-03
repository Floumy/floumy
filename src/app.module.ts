import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database.config";
import encryptionConfig from "./config/encryption.config";

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ConfigModule.forRoot({
            load: [databaseConfig, encryptionConfig],
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('database.host'),
                port: +configService.get('database.port'),
                username: configService.get('database.username'),
                password: configService.get('database.password'),
                database: configService.get('database.name'),
                entities: [],
                synchronize: true,
            }),
            inject: [ConfigService],
            imports: [ConfigModule]
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
