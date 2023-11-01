import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import databaseConfig from '../src/config/database.config';

// TODO: Fix flaky tests
const typeOrmModule = TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forRoot({
        load: [databaseConfig],
    })],
    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: +configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
    }),
    inject: [ConfigService],
});

export {typeOrmModule}
