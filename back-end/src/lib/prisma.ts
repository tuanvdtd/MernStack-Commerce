import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { PrismaClient } from "../generated/prisma/client";

import { env } from "~/config/env";
import { logger } from "~/config/logger";

const adapter = new PrismaMariaDb({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  connectionLimit: 10,
  connectTimeout: 10_000,
  acquireTimeout: 30_000,
  minimumIdle: 1,
});
const prisma = new PrismaClient({ adapter });

async function connectDatabase(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info(
      { host: env.DATABASE_HOST, port: env.DATABASE_PORT, database: env.DATABASE_NAME },
      "Database connected",
    );
  } catch (err) {
    logger.error(
      {
        err,
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        database: env.DATABASE_NAME,
      },
      "Database connection failed — check MySQL/MariaDB is running and .env credentials",
    );
    throw err;
  }
}

export { prisma, connectDatabase };