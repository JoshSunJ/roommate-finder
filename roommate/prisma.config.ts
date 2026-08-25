import "dotenv/config";
import { defineConfig, env } from "prisma/config";

import { getMigrationDatabaseUrl } from "./lib/database-config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL?.trim()
      ? getMigrationDatabaseUrl()
      : env("DATABASE_URL"),
  },
});
