import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../src/config/database.config';
import { testDbOptions } from './test-db.options';

const typeOrmModule = TypeOrmModule.forRootAsync({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
  useFactory: () => testDbOptions,
});

export { typeOrmModule };
