import "dotenv/config";

import {
  ProductionEnvironmentError,
  validateProductionEnvironment,
} from "../lib/production-environment";

try {
  const summary = validateProductionEnvironment();
  console.log("Production environment is valid.");
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  if (error instanceof ProductionEnvironmentError) {
    console.error(error.message);
  } else {
    console.error("Production environment validation failed unexpectedly.");
  }
  process.exitCode = 1;
}
