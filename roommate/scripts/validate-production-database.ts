import "dotenv/config";

import {
  DatabaseConfigurationError,
  validateProductionDatabaseConfiguration,
} from "../lib/database-config";

try {
  const configuration = validateProductionDatabaseConfiguration();
  console.log(
    `Runtime database: ${configuration.runtime.host}:${configuration.runtime.port}/${configuration.runtime.database}`,
  );
  console.log(
    `Migration database: ${configuration.migrations.host}:${configuration.migrations.port}/${configuration.migrations.database}`,
  );
  console.log(
    configuration.usesSeparateMigrationConnection
      ? "Runtime and migration connections are separated."
      : "One TLS connection is configured for runtime queries and migrations.",
  );
} catch (error: unknown) {
  const message = error instanceof DatabaseConfigurationError
    ? error.message
    : "Production database configuration could not be validated.";
  console.error(message);
  process.exitCode = 1;
}
