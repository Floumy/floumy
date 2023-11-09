import { DataSourceOptions } from "typeorm";

export const testDbOptions: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5455,
  username: "testuser",
  password: "testpass",
  database: "testdb",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: true
};
