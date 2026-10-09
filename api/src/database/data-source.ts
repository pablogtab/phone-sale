import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { entities } from './entities';

export const databaseOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5441),
  username: process.env.DATABASE_USER || 'phone_sale',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'phone_sale_app',
  schema: process.env.DATABASE_SCHEMA || 'public',
  entities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
};
export default new DataSource(databaseOptions);
