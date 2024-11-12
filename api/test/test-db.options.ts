import { DataSourceOptions } from 'typeorm';
import * as process from 'node:process';

export const testDbOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../src/migrations/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: false,
  logging: false,
};
