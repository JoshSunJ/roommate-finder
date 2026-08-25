import assert from "node:assert/strict";
import test from "node:test";

import {
  DatabaseConfigurationError,
  getMigrationDatabaseUrl,
  parseDatabaseTarget,
  validateProductionDatabaseConfiguration,
} from "../lib/database-config";
import { probeDatabase } from "../lib/database-health";

const pooledUrl = "postgresql://unitern:secret@unitern-pooler.example.com:6543/app?sslmode=require";
const directUrl = "postgresql://unitern:secret@unitern.example.com:5432/app?sslmode=verify-full";

test("database URLs are reduced to safe operational metadata", () => {
  const target = parseDatabaseTarget(pooledUrl, "DATABASE_URL");

  assert.deepEqual(target, {
    host: "unitern-pooler.example.com",
    port: "6543",
    database: "app",
    tlsEnabled: true,
    appearsPooled: true,
  });
  assert.equal(JSON.stringify(target).includes("secret"), false);
});

test("production validation supports separate runtime and migration connections", () => {
  const configuration = validateProductionDatabaseConfiguration({
    DATABASE_URL: pooledUrl,
    DIRECT_DATABASE_URL: directUrl,
  });

  assert.equal(configuration.runtime.appearsPooled, true);
  assert.equal(configuration.migrations.appearsPooled, false);
  assert.equal(configuration.usesSeparateMigrationConnection, true);
});

test("migration tooling falls back to DATABASE_URL", () => {
  assert.equal(
    getMigrationDatabaseUrl({ DATABASE_URL: directUrl }),
    directUrl,
  );
});

test("production validation rejects local and unencrypted targets", () => {
  assert.throws(
    () => validateProductionDatabaseConfiguration({
      DATABASE_URL: "postgresql://user:password@localhost:5432/app?sslmode=require",
    }),
    DatabaseConfigurationError,
  );
  assert.throws(
    () => validateProductionDatabaseConfiguration({
      DATABASE_URL: "postgresql://user:password@[::1]:5432/app?sslmode=require",
    }),
    DatabaseConfigurationError,
  );
  assert.throws(
    () => validateProductionDatabaseConfiguration({
      DATABASE_URL: "postgresql://user:password@database.example.com:5432/app",
    }),
    /TLS/,
  );
});

test("database health probes hide connection errors behind a boolean contract", async () => {
  assert.deepEqual(
    await probeDatabase(async () => 1),
    { reachable: true },
  );
  assert.deepEqual(
    await probeDatabase(async () => {
      throw new Error("contains private connection details");
    }),
    { reachable: false },
  );
});
