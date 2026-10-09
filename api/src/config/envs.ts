import * as joi from 'joi';
import { config } from 'dotenv';

export type Environment = {
  env: string;
  port: number;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  token: {
    secret: string;
    expiresIn: string;
  };
  fileSystem: {
    baseUrl: string;
  };
};

config();

const envSchema = joi
  .object({
    NODE_ENV: joi.string().required(),
    PORT: joi.number().required(),
    DATABASE_HOST: joi.string().required(),
    DATABASE_PORT: joi.number().required(),
    DATABASE_USER: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    DATABASE_SCHEMA: joi.string().default('public'),
  })
  .unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const environment: Environment = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    host: envVars.DATABASE_HOST,
    port: envVars.DATABASE_PORT,
    user: envVars.DATABASE_USER,
    password: envVars.DATABASE_PASSWORD,
  },
  token: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  fileSystem: {
    baseUrl:
      envVars.FILES_BASE_URL ||
      `http://localhost:${envVars.PORT}/api/public/files/`,
  },
};
