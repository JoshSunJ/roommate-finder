type Environment = Record<string, string | undefined>;

export type SafeDatabaseTarget = {
  host: string;
  port: string;
  database: string;
  tlsEnabled: boolean;
  appearsPooled: boolean;
};

export type ProductionDatabaseConfiguration = {
  runtime: SafeDatabaseTarget;
  migrations: SafeDatabaseTarget;
  usesSeparateMigrationConnection: boolean;
};

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

function requiredValue(value: string | undefined, name: string) {
  const normalized = value?.trim();
  if (!normalized) {
    throw new DatabaseConfigurationError(`${name} is required.`);
  }
  return normalized;
}

export function parseDatabaseTarget(value: string, name: string): SafeDatabaseTarget {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DatabaseConfigurationError(`${name} must be a valid PostgreSQL connection URL.`);
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new DatabaseConfigurationError(`${name} must use the postgresql:// or postgres:// protocol.`);
  }

  if (!url.hostname || !url.pathname.slice(1)) {
    throw new DatabaseConfigurationError(`${name} must include a host and database name.`);
  }

  const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
  const tlsEnabled = ["require", "verify-ca", "verify-full"].includes(sslMode ?? "")
    || url.searchParams.get("ssl") === "true";

  const host = url.hostname.replace(/^\[|\]$/g, "");

  return {
    host,
    port: url.port || "5432",
    database: decodeURIComponent(url.pathname.slice(1)),
    tlsEnabled,
    appearsPooled: url.hostname.includes("pooler") || url.port === "6543",
  };
}

function assertHostedProductionTarget(target: SafeDatabaseTarget, name: string) {
  const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
  if (localHosts.has(target.host)) {
    throw new DatabaseConfigurationError(`${name} cannot point to a local database in production.`);
  }
  if (!target.tlsEnabled) {
    throw new DatabaseConfigurationError(`${name} must require TLS in production.`);
  }
}

export function getMigrationDatabaseUrl(environment: Environment = process.env) {
  return environment.DIRECT_DATABASE_URL?.trim()
    || requiredValue(environment.DATABASE_URL, "DATABASE_URL");
}

export function validateProductionDatabaseConfiguration(
  environment: Environment = process.env,
): ProductionDatabaseConfiguration {
  const runtimeUrl = requiredValue(environment.DATABASE_URL, "DATABASE_URL");
  const migrationUrl = getMigrationDatabaseUrl(environment);
  const runtime = parseDatabaseTarget(runtimeUrl, "DATABASE_URL");
  const migrations = parseDatabaseTarget(migrationUrl, "DIRECT_DATABASE_URL");

  assertHostedProductionTarget(runtime, "DATABASE_URL");
  assertHostedProductionTarget(migrations, "DIRECT_DATABASE_URL");

  return {
    runtime,
    migrations,
    usesSeparateMigrationConnection: runtimeUrl !== migrationUrl,
  };
}
